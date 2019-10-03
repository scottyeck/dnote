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

import React, { useState } from 'react';
import classnames from 'classnames';

import Modal, { Header, Body } from '../Common/Modal';
import Flash from '../Common/Flash';
import { DAY, getUTCOffset } from '../../helpers/time';
import Button from '../Common/Button';
import GlobeIcon from '../Icons/Globe';
import styles from './CreateModal.scss';

// getFrequency translates the given number of days to seconds
function getFrequency(numDays: number) {
  const dayInSeconds = DAY / 1000;

  return dayInSeconds * numDays;
}

interface Props {
  isOpen: boolean;
  onDismiss: () => void;
}

const CreateRuleModal: React.FunctionComponent<Props> = ({
  isOpen,
  onDismiss
}) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [failureMsg, setFailureMsg] = useState('');
  const [inProgress, setInProgress] = useState(false);

  const labelId = 'frequency-modal';

  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <Modal
      modalId="T-create-rule-modal"
      isOpen={isOpen}
      onDismiss={onDismiss}
      ariaLabelledBy={labelId}
    >
      <Header
        labelId={labelId}
        heading="Create a spaced repetition"
        onDismiss={onDismiss}
      />

      <Flash
        when={successMsg !== ''}
        id="T-create-rule-modal-success"
        kind="success"
        onDismiss={() => {
          setSuccessMsg('');
        }}
        noMargin
      >
        {successMsg}
      </Flash>
      <Flash
        when={failureMsg !== ''}
        kind="danger"
        onDismiss={() => {
          setFailureMsg('');
        }}
        noMargin
      >
        {failureMsg}
      </Flash>

      <Body>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="input-row">
            <label className="input-label" htmlFor="title">
              Name
            </label>

            <input
              autoFocus
              type="text"
              id="title"
              className="text-input text-input-small text-input-stretch"
              placeholder="Weekly algorithm reminder"
            />
          </div>

          <div
            className={classnames('input-row', styles['schedule-input-row'])}
          >
            <div className={styles['schedule-wrapper']}>
              <div>
                <label className="input-label" htmlFor="frequency">
                  Frequency
                </label>
              </div>

              <select id="frequency" className="form-select">
                <option value={getFrequency(1)}>Every day</option>
                <option value={getFrequency(2)}>Every 2 days</option>
                <option value={getFrequency(3)}>Every 3 days</option>
                <option value={getFrequency(4)}>Every 4 days</option>
                <option value={getFrequency(5)}>Every 5 days</option>
                <option value={getFrequency(6)}>Every 6 days</option>
                <option value={getFrequency(7)}>Every week</option>
                <option value={getFrequency(14)}>Every 2 weeks</option>
                <option value={getFrequency(21)}>Every 3 weeks</option>
                <option value={getFrequency(28)}>Every 4 weeks</option>
              </select>
            </div>

            <div className={classnames('input-row', styles['time-row'])}>
              <div className={styles['schedule-wrapper']}>
                <label className="input-label" htmlFor="hour">
                  Hour
                </label>

                <select id="hour" className="form-select">
                  {[...Array(24)].map((_, i) => {
                    return (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className={styles['schedule-wrapper']}>
                <label className="input-label" htmlFor="minutes">
                  Minutes
                </label>

                <select id="minutes" className="form-select">
                  {[...Array(60)].map((_, i) => {
                    return (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className={classnames(styles.timezone)}>
              <GlobeIcon width={16} height={16} fill="#4d4d8b" /> UTC
            </div>
          </div>

          <div className="actions">
            <Button
              type="submit"
              kind="first"
              size="normal"
              isBusy={inProgress}
            >
              Update
            </Button>

            <Button
              type="button"
              kind="second"
              size="normal"
              isBusy={inProgress}
              onClick={onDismiss}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Body>
    </Modal>
  );
};

export default CreateRuleModal;
