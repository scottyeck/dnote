import React, { useState } from 'react';
import Helmet from 'react-helmet';

import Logo from '../Icons/Logo';
import authStyles from '../Common/Auth.scss';
import Flash from '../Common/Flash';
// import { useDispatch } from '../../store';
// import { getCurrentUser } from '../../store/auth';
import JoinForm from '../Join/JoinForm';
import * as usersService from '../../services/users';

interface Props {}

const SetPassword: React.SFC<Props> = () => {
  const [errMsg, setErrMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // const dispatch = useDispatch();

  async function handleJoin(email, password, passwordConfirmation) {
    if (!password) {
      setErrMsg('Please enter a pasasword.');
      return;
    }
    if (!passwordConfirmation) {
      setErrMsg('The passwords do not match.');
      return;
    }

    setErrMsg('');
    setSubmitting(true);

    try {
      await usersService.classicSetPassword({ password });
      // guestOnly HOC will redirect the user accordingly after the current user is fetched
      // await dispatch(getCurrentUser());
    } catch (err) {
      console.log(err);
      setErrMsg(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className={authStyles.page}>
      <Helmet>
        <title>Set password (Classic)</title>
      </Helmet>
      <div className="container">
        <a href="/">
          <Logo fill="#252833" width={60} height={60} />
        </a>
        <h1 className={authStyles.heading}>Set password</h1>

        <div className={authStyles.body}>
          <div className={authStyles.panel}>
            {errMsg && (
              <Flash kind="danger" wrapperClassName={authStyles['error-flash']}>
                {errMsg}
              </Flash>
            )}

            <JoinForm
              onJoin={handleJoin}
              submitting={submitting}
              cta="Confirm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
