import services from '../../utils/services';

import {
  START_FETCHING,
  RECEIVE,
  RECEIVE_ERROR,
  StartFetchingAction,
  ReceiveAction,
  ReceiveErrorAction
} from './types';

function startFetchingBooks(): StartFetchingAction {
  return {
    type: START_FETCHING
  };
}

function receiveBooks(books): ReceiveAction {
  return {
    type: RECEIVE,
    data: {
      books
    }
  };
}

function receiveBooksError(error): ReceiveErrorAction {
  return {
    type: RECEIVE_ERROR,
    data: {
      error
    }
  };
}

export function fetchBooks(key, cipherKey) {
  return dispatch => {
    dispatch(startFetchingBooks());

    services.books
      .fetch(
        {},
        {
          headers: {
            Authorization: `Bearer ${key}`
          }
        }
      )
      .then(books => {
        dispatch(receiveBooks(books));
      })
      .catch(err => {
        console.log('error fetching books', err);
        dispatch(receiveBooksError(err));
      });
  };
}
