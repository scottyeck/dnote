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
import { daysToSec } from '../../helpers/time';
import Button from '../Common/Button';
import GlobeIcon from '../Icons/Globe';
import styles from './CreateModal.scss';
import modalStyles from '../Common/Modal/Modal.scss';

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
  // const [formState, formDispatch] = useReducer(formReducer, formInitialState);

  const labelId = 'create-repetition-modal';

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
          <div className={modalStyles['input-row']}>
            <label className="input-label" htmlFor="title">
              Name
            </label>

            <input
              autoFocus
              type="text"
              id="title"
              className="text-input text-input-small text-input-stretch"
              placeholder="Weekly vocabulary reminder"
            />
          </div>

          <div
            className={classnames(
              modalStyles['input-row'],
              styles['schedule-wrapper']
            )}
          >
            <div className={styles['schedule-content']}>
              <div className={classnames(styles['schedule-input-wrapper'])}>
                <label className="input-label" htmlFor="frequency">
                  How often?
                </label>

                <select id="frequency" className="form-select">
                  <option value={daysToSec(1)}>Every day</option>
                  <option value={daysToSec(2)}>Every 2 days</option>
                  <option value={daysToSec(3)}>Every 3 days</option>
                  <option value={daysToSec(4)}>Every 4 days</option>
                  <option value={daysToSec(5)}>Every 5 days</option>
                  <option value={daysToSec(6)}>Every 6 days</option>
                  <option value={daysToSec(7)}>Every week</option>
                  <option value={daysToSec(14)}>Every 2 weeks</option>
                  <option value={daysToSec(21)}>Every 3 weeks</option>
                  <option value={daysToSec(28)}>Every 4 weeks</option>
                </select>
              </div>

              <div className={styles['schedule-input-wrapper']}>
                <label className="input-label" htmlFor="hour">
                  Hour
                </label>

                <select
                  id="hour"
                  className={classnames('form-select', styles['time-select'])}
                >
                  {[...Array(24)].map((_, i) => {
                    return (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className={styles['schedule-input-wrapper']}>
                <label className="input-label" htmlFor="minutes">
                  Minutes
                </label>

                <select
                  id="minutes"
                  className={classnames('form-select', styles['time-select'])}
                >
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
              <div>
                <GlobeIcon width={12} height={12} fill="#717171" /> UTC
                (Coordinated Universal Time)
              </div>
            </div>
          </div>

          <div className={modalStyles.actions}>
            <Button
              type="submit"
              kind="first"
              size="normal"
              isBusy={inProgress}
            >
              Create
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
