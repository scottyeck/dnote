/* Copyright (C) 2019 Monomax Software Pty Ltd
 *
 * This file is part of Dnote.
 *
 * Dnote is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Dnote is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Dnote.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import Helmet from 'react-helmet';

import Flash from '../../Common/Flash';
import { getDigestRules } from '../../../store/digestRules';
import { useSelector, useDispatch } from '../../../store';
import SettingRow from '../SettingRow';
import { SettingSections, getSettingsPath } from 'web/libs/paths';
import Button from '../../Common/Button';
import styles from './Digests.scss';
import settingsStyles from '../Settings.scss';

interface Props {}

const Email: React.FunctionComponent<Props> = () => {
  const dispatch = useDispatch();

  const { user, digestRules } = useSelector(state => {
    return {
      user: state.auth.user.data,
      digestRules: state.digestRules
    };
  });

  useEffect(() => {
    if (!digestRules.isFetched) {
      dispatch(getDigestRules());
    }
  }, [dispatch, digestRules.isFetched]);

  const [successMsg, setSuccessMsg] = useState('');
  const [failureMsg, setFailureMsg] = useState('');

  return (
    <div>
      <Helmet>
        <title>Spaced Repetition</title>
      </Helmet>

      <Flash
        when={successMsg !== ''}
        kind="success"
        wrapperClassName={settingsStyles.flash}
        onDismiss={() => {
          setSuccessMsg('');
        }}
      >
        {successMsg}
      </Flash>

      <Flash
        when={failureMsg !== ''}
        kind="danger"
        wrapperClassName={settingsStyles.flash}
        onDismiss={() => {
          setFailureMsg('');
        }}
      >
        {failureMsg}
      </Flash>

      <Flash
        when={digestRules.errorMessage !== ''}
        kind="danger"
        wrapperClassName={settingsStyles.flash}
      >
        <div>Error fetching notification preference:</div>
        {digestRules.errorMessage}
      </Flash>

      <Flash
        when={!user.emailVerified}
        kind="info"
        wrapperClassName={settingsStyles.flash}
        contentClassName={settingsStyles['verification-banner']}
      >
        <div>
          You need to verify your email before Dnote can send you digests.
        </div>
        <Link
          to={getSettingsPath(SettingSections.account)}
          className={classnames(
            'button button-normal button-second',
            settingsStyles['verification-banner-cta']
          )}
        >
          Go to account settings
        </Link>
      </Flash>

      <div className={settingsStyles.wrapper}>
        <section className={settingsStyles.section}>
          <h2 className={settingsStyles['section-heading']}>Automation</h2>

          <div className={styles.body}>
            <p>
              These are the rules for automating the spaced repeition. Customize
              to keep your knowledge flowing.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Email;
