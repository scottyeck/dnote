import { UPDATE_CONTENT, ComposerActionType, ComposerState } from './types';

const initialState: ComposerState = {
  content: ''
};

export default function(
  state = initialState,
  action: ComposerActionType
): ComposerState {
  switch (action.type) {
    case UPDATE_CONTENT:
      return {
        ...state,
        content: action.data.content
      };
    default:
      return state;
  }
}
