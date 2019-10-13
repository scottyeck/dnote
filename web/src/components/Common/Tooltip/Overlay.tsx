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
import ReactDOM from 'react-dom';
import classnames from 'classnames';

import Popover from '../Popover';
import { Alignment, Direction } from '../Popover/types';
import styles from './Tooltip.scss';

interface Props {
  isOpen: boolean;
  children: React.ReactElement;
  triggerEl: HTMLElement;
  alignment: Alignment;
  direction: Direction;
}

const verticalArrowHeight = 4;
const horizontalArrowWidth = 4;

function calcY(
  triggerRect: ClientRect,
  alignemnt: Alignment,
  direction: Direction
): number {
  if (direction === 'bottom') {
    return triggerRect.bottom + verticalArrowHeight;
  }
  if (direction === 'top') {
    return triggerRect.top - verticalArrowHeight;
  }
  if (alignemnt === 'bottom') {
    return triggerRect.bottom;
  }
  if (alignemnt === 'top') {
    return triggerRect.top;
  }

  return 0;
}

function calcX(
  triggerRect: ClientRect,
  overlayRect: ClientRect,
  alignment: Alignment,
  direction: Direction
): number {
  if (alignment === 'left') {
    return triggerRect.left;
  }
  if (alignment === 'right') {
    return triggerRect.right - overlayRect.width;
  }
  if (alignment === 'center') {
    return triggerRect.left + (triggerRect.width - overlayRect.width) / 2;
  }
  if (direction === 'left') {
    return triggerRect.left - horizontalArrowWidth;
  }
  if (direction === 'right') {
    return triggerRect.right + horizontalArrowWidth;
  }

  return 0;
}

function calcOverlayPosition(
  triggerEl: HTMLElement,
  overlayEl: HTMLElement,
  direction: Direction,
  alignment: Alignment
) {
  if (triggerEl === null) {
    return null;
  }
  if (overlayEl === null) {
    return { top: -999, left: -999 };
  }

  const triggerRect = triggerEl.getBoundingClientRect();
  const overlayRect = overlayEl.getBoundingClientRect();

  const x = calcX(triggerRect, overlayRect, alignment, direction);
  const y = calcY(triggerRect, alignment, direction);

  return { top: y, left: x };
}

const Overlay: React.FunctionComponent<Props> = ({
  isOpen,
  children,
  triggerEl,
  alignment,
  direction
}) => {
  const [overlayEl, setOverlayEl] = useState(null);

  if (!isOpen) {
    return null;
  }

  const overlayRoot = document.getElementById('overlay-root');
  const pos = calcOverlayPosition(triggerEl, overlayEl, direction, alignment);

  return ReactDOM.createPortal(
    <div
      className={styles.overlay}
      style={{ top: pos.top, left: pos.left }}
      ref={el => {
        setOverlayEl(el);
      }}
    >
      {children}
    </div>,
    overlayRoot
  );
};

export default Overlay;
