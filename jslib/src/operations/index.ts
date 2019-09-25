import { HttpClientConfig } from '../helpers/http';
import initBooksOperations from './books';
import initNotesOperations from './notes';

// init initializes service helpers with the given http configuration
// and returns an object of all services.
export default function initOperations(c: HttpClientConfig) {
  const books = initBooksOperations(c);
  const notes = initNotesOperations(c);

  return {
    books,
    notes
  };
}
