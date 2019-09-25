import React, { useState, useEffect, useRef } from 'react';
import classnames from 'classnames';

import { KEYCODE_ENTER } from 'jslib/helpers/keyboard';
import BookSelector from './BookSelector';
import Flash from './Flash';
import { useSelector, useDispatch } from '../store/hooks';
import { updateContent } from '../store/composer/actions';
import { fetchBooks } from '../store/books/actions';
import { navigate } from '../store/location/actions';

interface Props {}

const Composer: React.FunctionComponent<Props> = () => {
  const [contentFocused, setContentFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const dispatch = useDispatch();
  const contentRef = useRef(null);

  const { content } = useSelector(state => {
    return {
      content: state.composer.content
    };
  });

  const handleSubmit = e => {
    e.preventDefault();
  };

  const handleSubmitShortcut = e => {
    // Shift + Enter
    if (e.shiftKey && e.keyCode === KEYCODE_ENTER) {
      handleSubmit(e);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleSubmitShortcut);

    return () => {
      window.removeEventListener('keydown', handleSubmitShortcut);
    };
  }, []);

  useEffect(() => {}, []);

  let submitBtnText;
  if (submitting) {
    submitBtnText = 'Saving...';
  } else {
    submitBtnText = 'Save';
  }

  return (
    <div className="composer">
      <Flash when={errMsg !== ''} message={errMsg} />

      <form onSubmit={handleSubmit} className="form">
        <div className="content-container">
          <textarea
            className="content"
            placeholder="What did you learn?"
            onChange={e => {
              const val = e.target.value;

              dispatch(updateContent(val));
            }}
            value={content}
            ref={contentRef}
            onFocus={() => {
              setContentFocused(true);
            }}
            onBlur={() => {
              setContentFocused(false);
            }}
          />

          <div
            className={classnames('shortcut-hint', { shown: contentFocused })}
          >
            Shift + Enter to save
          </div>
        </div>

        <input
          type="submit"
          value={submitBtnText}
          className="submit-button"
          disabled={submitting}
        />
      </form>
    </div>
  );
};

export default Composer;
