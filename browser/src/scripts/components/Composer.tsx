import React, { useState, useEffect } from 'react';
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
  const dispatch = useDispatch();

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

  return <div>composer</div>;
};

export default Composer;
