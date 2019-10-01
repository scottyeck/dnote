import React, { useReducer, useCallback, useEffect } from 'react';

import * as localStorageLib from 'web/libs/localStorage';

export interface EditorState {
  noteUUID: string | null;
  bookUUID: string | null;
  bookLabel: string | null;
  content: string;
  dirty: boolean;
}

export const UPDATE_CONTENT = 'UPDATE_CONTENT';
export const UPDATE_BOOK = 'UPDATE_BOOK';

export interface UpdateContentAction {
  type: typeof UPDATE_CONTENT;
  data: {
    content: string;
  };
}

export interface UpdateBookAction {
  type: typeof UPDATE_BOOK;
  data: {
    uuid: string;
    label: string;
  };
}

type EditorAction = UpdateContentAction | UpdateBookAction;

function reducer(state: EditorState, action) {
  switch (action.type) {
    case UPDATE_CONTENT: {
      return {
        ...state,
        content: action.data.content,
        dirty: true
      };
    }
    case UPDATE_BOOK: {
      return {
        ...state,
        bookUUID: action.data.uuid,
        bookLabel: action.data.label
      };
    }
    default:
      return state;
  }
}

export interface UpdateBookActionParam {
  uuid: string;
  label: string;
}

export function updateBook({ uuid, label }: UpdateBookActionParam) {
  return {
    type: UPDATE_BOOK,
    data: {
      uuid,
      label
    }
  };
}

export function updateContent(content) {
  return {
    type: UPDATE_CONTENT,
    data: {
      content
    }
  };
}

interface EditorDispatchers {
  updateContent: (string) => void;
  updateBook: (UpdateBookActionParam) => void;
  clear: () => void;
}

const defaultState: EditorState = {
  noteUUID: null,
  bookUUID: null,
  bookLabel: null,
  content: '',
  dirty: false
};

// getInitialState retrieves the initial state for the editor from an offline
// data source applicable to the platform.
function getInitialState() {
  return localStorageLib.getObj(localStorageLib.editorKey) || defaultState;
}

// useEditor returns an editor state and a map of dispatchers to modify the
// state.
export function useEditor(): [EditorState, EditorDispatchers] {
  const initialState = getInitialState();
  const [state, dispatch] = useReducer(reducer, initialState);

  // persist the editor state to the localStorage
  useEffect(() => {
    localStorageLib.setObj(localStorageLib.editorKey, state);
  }, [state]);

  const dispatchers = {
    updateContent: (content: string) => {
      dispatch(updateContent(content));
    },
    updateBook: (params: UpdateBookActionParam) => {
      dispatch(updateBook(params));
    },
    clear: () => {
      localStorage.removeItem(localStorageLib.editorKey);
    }
  };

  return [state, dispatchers];
}
