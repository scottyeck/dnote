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

import React, { useState, useRef } from 'react';
import classnames from 'classnames';

import Menu from '../../Common/Menu';
import DotsIcon from '../../Icons/Dots';
import styles from './BookItem.scss';

interface Props {
  bookUUID: string;
  onDeleteBook: (string) => void;
}

const MobileActions: React.FunctionComponent<Props> = ({
  bookUUID,
  onDeleteBook
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const optRefs = [useRef(null)];
  const options = [
    {
      name: 'remove',
      value: (
        <button
          ref={optRefs[0]}
          type="button"
          className={classnames('button-no-ui button-stretch', styles.action)}
          onClick={() => {
            setIsOpen(false);
            onDeleteBook(bookUUID);
          }}
        >
          Remove&hellip;
        </button>
      )
    }
  ];

  return (
    <div
      className={classnames(styles.actions, {
        [styles['actions-active']]: isOpen
      })}
    >
      <Menu
        options={options}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        optRefs={optRefs}
        menuId="mobile-book-actions"
        triggerId="mobile-book-actions-trigger"
        triggerContent={<DotsIcon width={12} height={12} />}
        triggerClassName={styles['action-trigger']}
        contentClassName={styles['action-content']}
        alignment="right"
        direction="bottom"
      />
    </div>
  );
};

export default MobileActions;
