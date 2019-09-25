import { UPDATE_CONTENT, UpdateContentAction } from './types';

export function updateContent(content: string): UpdateContentAction {
  return {
    type: UPDATE_CONTENT,
    data: { content }
  };
}
