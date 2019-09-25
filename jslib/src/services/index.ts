import { HttpClientConfig } from '../helpers/http';
import initUsersService from './users';
import initBooksService from './books';
import initNotesService from './notes';
import initDigestsService from './digests';
import initPaymentService from './payment';

// init initializes service helpers with the given http configuration
// and returns an object of all services.
export default function initServices(c: HttpClientConfig) {
  const users = initUsersService(c);
  const books = initBooksService(c);
  const notes = initNotesService(c);
  const digests = initDigestsService(c);
  const payment = initPaymentService(c);

  return {
    users,
    books,
    notes,
    digests,
    payment
  };
}
