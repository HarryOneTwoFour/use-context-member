## 说明
###### `use-context-member`提供了`useMember` hook，可以更方便的使用React Context，并减少渲染次数。
###### - 使用官方useContext：`const { user } = useContext(UserContext)`
###### - 使用useMember：`const [user, setUser] = useMember(UserContext, 'user')`
###### 两个例子都是通过hooks获得context中的user成员。useMember同时返回了一个setter，可以更方便的对context中的成员进行修改。useMember同时也减少了渲染次数，在这个例子中，只有user发生变化时，所在的组件才会重新渲染。而如果使用useContext的话，只要context发生了变化，不管user有没有变化，所在的组件都会重新渲染。

## 安装
npm i -D use-context-member

## API
### createContext
`use-context-member`提供了`createContext`，其用法和`React.createContext`一致。你不能直接使用`React.createContext`
```
import { createContext } from 'use-context-member';

const UserContext = createContext();

const User = () => {
  const user = {name: {firstname: 'Harry', lastname: ''}, id: '001', email: ['harry@mail.com']};
  return (
    <UserContext.Provider value={user}>
      <SomeOtherComponent />
    </UserContext.Provider>
  )
}
```
context内部会更新user的值，如果需要在context外部监听user的变化，可以使用onChange属性
```
const handleChange = useCallback(data => {
  // do something
}, [])
return (
  <UserContext.Provider value={user} onChange={handleChange}>
    <SomeInnerComponents />
  </UserContext.Provider>
)
```

### useMember
```
import { useMember } from 'use-context-member';

const [name, setName] = useMember(UserContext, 'name')
```
###### `name`, `setName`与`useState`的返回值类似。同`setState`一样，`setName`的参数支持用一个新的值更新，也支持通过一个函数更新
###### 第一个参数是前面创建的Context
###### 第二个参数是一个表达式，规则简单，用来从context中选择成员。如果不传第二个参数，表示选择整个context的值。
###### - 用`.`来从object中选择，第一个`.`可以省略： `'name.firstname'`, 也可以用`[]`来选择：`'[name][firstname]'`，也可以混合使用：`'name[firstname]'`
###### - 用`[]`从数组中选择：`'email[0]'`。支持负数：`'email[-1]'`, 其含义与`Array.slice`的参数一致。支持简单的筛选，比如context的value是 `[{id: '001'}, {id: '002'}]`, 可以用`'[id==001]'`选择出第一个元素（仅支持`==`）。
###### 如果选择的成员是一个数组中的元素，你还可以使用返回值中的第三个值来删除这个元素。`const [email, setEmail, deleteEmail] = useMember(UserContext, 'email[0]')`, 执行`deleteEmail()`便可以从context中删除这个元素。
###### useMember返回值中的setter和deleter都是稳定的，不会变化，可以放心的放入hooks的的dependencies中。

### useOperations
```
import { useOperations } from 'use-context-member';

const [setEmail, deleteEmail] = useOperations(UserContext, 'email[0]`)
```
###### 和useMember类似，只是不会返回选择的成员的值，只返回对该成员的操作。

### useSelector
```
import { useSelector } from 'use-context-member';

const email = useSelector(UserContext, s => s.email.find(email => email.endsWith('mail.com')))
```
###### 与Redux中的useSelector类似，通过一个函数来筛选成员（或者任意值）。useMember可以解决大部分场景，但是遇到复杂的场景时，可能不能通过表达式的方式来筛选成员。这个时候就可以使用useSelector了，但缺点是没有setter，如果需要更新可以用useOperations获得setter，然后进行更新。推荐使用 [immer](https://immerjs.github.io/immer/docs/introduction) 来应对复杂的更新场景。

### 空指针与数组越界
###### useMember，useOperations，useSelector内部已经catch住了这些异常，返回的成员值为`undefined`。这是因为Context.Provider与其它状态管理框架（比如Redux）不同，它其实就是一个组件，可以被多次使用，所以我们应该允许context初始化时使用空的value，然后在副作用中更新它。

## 样例
```
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createContext, useMember } from 'use-context-member'

const BookContext = createContext();

const Book = ({ id }) => {
  const [book, setBook, deleteBook] = useMember(BookContext, `books[id==${id}]`);
  if (!book) { // handle stale props issue(that is, if you used props in useMember's expression, the returned member can be undefined.)
    return <></>;
  }
  const { name, count } = book;
  return (
    <div>
      <div>{name}</div>
      <div>Count: {count}</div>
      <button onClick={() => setBook({ ...book, count: book.count + 1 })}>Add Count</button>
      <button onClick={() => deleteBook()}>Delete</button>
    </div >
  )
}

const BookList = () => {
  const [books = [], setBooks] = useMember(BookContext, 'books');
  const [title] = useMember(BookContext, 'title');
  const maxId = useRef(5);

  const handleAddBook = useCallback(() => {
    maxId.current += 1;
    setBooks(prev => [...prev, { name: 'Book' + maxId.current, count: 1, id: maxId.current }]);
  }, [setBooks]); // `setBooks` is stable.

  return (
    <div>
      <div>{title}</div>
      {
        books.map(book => <Book key={book.id} id={book.id} />)
      }
      <button onClick={handleAddBook}>Add Book</button>
    </div>
  )
}

export const TestPage = () => {
  const [bookContext, setBookContext] = useState();

  useEffect(() => { // set context value in side effect is ok, for useMember just return undefined when target member can't be found.
    const mockBooks = [];
    for (var i = 0; i < 1; ++i) {
      mockBooks.push({ id: i, name: 'Book' + i, count: 1 });
    }
    setBookContext({
      books: mockBooks,
      title: 'Book List',
    })
  }, [])

  return (
    <BookContext.Provider value={bookContext}>
      <BookList />
    </BookContext.Provider>
  )
}
```

## License
[MIT](https://choosealicense.com/licenses/mit/)

