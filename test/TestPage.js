import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createContext, useMember, useOperations, useSelector } from '../src';

const BookContext = createContext();

const Book = ({ id }) => {
  console.log('book rendered');
  useEffect(() => {
    console.log('ddd')
  });
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
  console.log('book list rendered')
  // const [books = [], setBooks] = useMember(BookContext, 'books');
  const books = useSelector(BookContext, s => s.books) || [];
  const [setBooks] = useOperations(BookContext, 'books');
  const [title] = useMember(BookContext, 'title');
  const maxId = useRef(5);
  useEffect(() => {
    console.log('ddd')
  });

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