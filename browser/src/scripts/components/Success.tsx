import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Flash from './Flash';
import ext from '../utils/ext';
import config from '../utils/config';
import BookIcon from './BookIcon';
import { navigate } from '../store/location/actions';
import { useSelector, useDispatch } from '../store/hooks';

const Success: React.FunctionComponent = () => {
  const [errorMsg, setErrorMsg] = useState('');

  const dispatch = useDispatch();
  const { location } = useSelector(state => {
    return {
      location: state.location
    };
  });

  const { bookName, noteUUID } = location.state;

  const handleKeydown = e => {
    e.preventDefault();

    if (e.keyCode === 13) {
      // Enter key
      dispatch(navigate('/'));
    } else if (e.keyCode === 27) {
      // ESC key
      window.close();
    } else if (e.keyCode === 66) {
      // b key
      const url = `${config.webUrl}/app/notes/${noteUUID}`;

      ext.tabs
        .create({ url })
        .then(() => {
          window.close();
        })
        .catch(err => {
          setErrorMsg(err.message);
        });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', this.handleKeydown);

    return () => {
      window.removeEventListener('keydown', this.handleKeydown);
    };
  }, []);

  return (
    <Fragment>
      <Flash when={errorMsg !== ''} message={errorMsg} />

      <div className="success-page">
        <div>
          <BookIcon width={20} height={20} className="book-icon" />

          <h1 className="heading">Saved to {bookName}</h1>
        </div>

        <ul className="key-list">
          <li className="key-item">
            <kbd className="key">Enter</kbd>{' '}
            <div className="key-desc">Go back</div>
          </li>
          <li className="key-item">
            <kbd className="key">b</kbd>{' '}
            <div className="key-desc">Open in browser</div>
          </li>
          <li className="key-item">
            <kbd className="key">ESC</kbd> <div className="key-desc">Close</div>
          </li>
        </ul>
      </div>
    </Fragment>
  );
};

export default Success;
