import { get } from "../utils/fetch";
import config from "../utils/config";

export const START_FETCHING = "books/START_FETCHING";
export const RECEIVE = "books/RECEIVE";
export const RECEIVE_ERROR = "books/RECEIVE_ERROR";
export const SELECT = "books/SELECT";
export const ADD = "books/ADD";
export const REMOVE = "books/REMOVE";

function startFetchingBooks() {
  return {
    type: START_FETCHING
  };
}

function receiveBooks(books) {
  return {
    type: RECEIVE,
    data: {
      books
    }
  };
}

export function selectBook(uuid) {
  return {
    type: SELECT,
    data: {
      uuid
    }
  };
}

export function addBook(book) {
  return {
    type: ADD,
    data: {
      book
    }
  };
}

export function removeBook(bookId) {
  return {
    type: REMOVE,
    data: {
      uuid
    }
  };
}

function receiveBooksError(error) {
  return {
    type: RECEIVE_ERROR,
    data: {
      error
    }
  };
}

export async function decryptBook(book, cipherKeyBuf) {
  return {
    ...book,
    label: book.label
  };
}

export function fetchBooks(key, cipherKey) {
  console.log("cipherKey", cipherKey);
  return dispatch => {};
}
