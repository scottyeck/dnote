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

import React, { Fragment, useState, useRef } from 'react';
import classnames from 'classnames';

import Overlay from './Overlay';
import { Alignment, Direction } from '../Popover/types';
import { isMobileWidth } from 'web/libs/dom';

interface Props {
  id: string;
  alignment: Alignment;
  direction: Direction;
  overlay: React.ReactElement;
  children: React.ReactChild;
  contentClassName?: string;
  wrapperClassName?: string;
  triggerClassName?: string;
}

const Tooltip: React.FunctionComponent<Props> = ({
  id,
  alignment,
  direction,
  wrapperClassName,
  overlay,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  function show() {
    setIsOpen(true);
  }

  function hide() {
    setIsOpen(false);
  }

  function toggle() {
    setIsOpen(!isOpen);
  }

  return (
    <Fragment>
      <span
        className={wrapperClassName}
        aria-describedby={id}
        tabIndex={-1}
        onFocus={show}
        onMouseEnter={show}
        onMouseLeave={hide}
        onBlur={hide}
        ref={triggerRef}
        onTouchStart={e => {
          if (isMobileWidth()) {
            e.preventDefault();
            toggle();
          }
        }}
      >
        {children}
      </span>

      <Overlay
        isOpen={isOpen}
        triggerEl={triggerRef.current}
        alignment={alignment}
        direction={direction}
      >
        {overlay}
      </Overlay>
    </Fragment>
  );
};

export default Tooltip;
