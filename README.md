## Introduction
###### `use-context-member` provided `useMember` hook,to use React Context more easily and reduce component render times.
###### - Official `useContext`: `const { user } = useContext(UserContext)`
###### - Our `useMember`: `const [user, setUser] = useMember(UserContext, 'user')`
###### The 2 examples are both to select user value from UserContext. Our `useMember` hook also returned a setter, you can directly use it to modify user. What's more `useMember` will reduce component's render times. Only if user is changed, the component will re-render. Well for `useContext`, the component will re-render when any member of UserContext changed.

## Install
npm i -D use-context-member

## API
### createContext
`use-context-member` Provided `createContext`, same usage with `React.createContext`.You can not use `React.createContext` directly.
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
inside context, we maintained it's state, if you need to listen the change of it, you can use `onChange` property.
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
###### [name, setName] are similar with `useState`. function type param are supported for `setName` too.
###### The first param is the `UserContext` you created.
###### The second param is an expression, used to select member from context. If you left it as `undefined`, then it means to select the whole context. expression rules are simple.
###### - use `.` to select member from object, the first `.` can be omitted: `'name.firstname'`, You can also use `[]` to select: `'[name][firstname]'`, Sure you can mix the both: `'name[firstname]'`
###### - use `[]` to select member from array: `'email[0]'`. negative number are supported too: `'email[-1]'`, same meaning as param for `Array.slice`. You can even make a simple finder: for example when context is `[{id: '001'}, {id: '002'}]`, use `'[id==001]'` to select the first element(only `==` is supported at here).
###### When the selected member is an element of an array, a deleter are provided as the third part of return value: `const [email, setEmail, deleteEmail] = useMember(UserContext, 'email[0]')`, execute `deleteEmail()` will delete this email form the email array.
###### the returned setter and deleter are both stable, so you can safely append them to some hooks' dependencies, e.g., useCallback, useEffect.

### useOperations
```
import { useOperations } from 'use-context-member';

const [setEmail, deleteEmail] = useOperations(UserContext, 'email[0]`)
```
###### Same with `useMember`, except that this hook will not get the select member itself.

### useSelector
```
import { useSelector } from 'use-context-member';

const email = useSelector(UserContext, s => s.email.find(email => email.endsWith('mail.com')))
```
###### Like Redux, use a function to select member. useMember can handle most scenario in your application. However expression is not enough for some complex cases, and then please use `useSelector` instead. On the other hand, `useSelector` don't provide a setter, you need to use `useOperations` to get one. I suggest you use [immer](https://immerjs.github.io/immer/docs/introduction) to deal with complex update logic.

### No need to care NPE in hooks
###### `useMember`, `useOperations` and `useSelector` have already catch the exceptions, and return `undefined` as the selected member's value when exception occurred. That's because Context.Provider is just a component, we should allow to leave it's value as null in initialization, and then update it in side effects.

## One Example
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

