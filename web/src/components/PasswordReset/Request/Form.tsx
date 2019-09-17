import React, { useState } from 'react';

import Button from '../../Common/Button';
import styles from '../../Common/Auth.scss';

interface Props {
  onSubmit: (email: string) => void;
  submitting: boolean;
}

const PasswordResetRequestForm: React.SFC<Props> = ({
  onSubmit,
  submitting
}) => {
  const [email, setEmail] = useState('');

  return (
    <form
      onSubmit={e => {
        e.preventDefault();

        onSubmit(email);
      }}
      className="auth-form"
    >
      <div className={styles['input-row']}>
        <label htmlFor="email-input" className={styles.label}>
          Enter your email and we will send you a link to reset your password
          <input
            id="email-input"
            type="email"
            placeholder="you@example.com"
            className="form-control"
            value={email}
            onChange={e => {
              const val = e.target.value;

              setEmail(val);
            }}
          />
        </label>
      </div>

      <Button
        type="submit"
        size="normal"
        kind="first"
        stretch
        className={styles['auth-button']}
        isBusy={submitting}
      >
        Send password reset email
      </Button>
    </form>
  );
};

export default PasswordResetRequestForm;
