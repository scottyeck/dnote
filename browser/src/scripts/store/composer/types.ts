export interface ComposerState {
  content: string;
}

export const UPDATE_CONTENT = 'composer/UPDATE_CONTENT';

export interface UpdateContentAction {
  type: typeof UPDATE_CONTENT;
  data: {
    content: string;
  };
}

export type ComposerActionType = UpdateContentAction;
