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

import React, { useState, useRef, useEffect } from 'react';
import classnames from 'classnames';

import { booksToOptions, filterOptions, Option } from 'jslib/helpers/select';
import { useSearchMenuKeydown } from 'web/libs/hooks/dom';
import { useSelector } from '../../store';
import PopoverContent from '../Common/Popover/PopoverContent';
import { usePrevious } from 'web/libs/hooks';
import styles from './MultiSelect.scss';

interface Props {
  options: Option[];
  currentOptions: Option[];
  setCurrentOptions: (Option) => void;
  disabled?: boolean;
}

// TODO: Make a generic Select component that works for both single and multiple selection
// by passing of a flag
const MultiSelect: React.SFC<Props> = ({
  options,
  currentOptions,
  setCurrentOptions,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [focusedOptEl, setFocusedOptEl] = useState(null);
  const [term, setTerm] = useState('');

  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  const currentValues = currentOptions.map(o => {
    return o.value;
  });
  const possibleOptions = options.filter(o => {
    return currentValues.indexOf(o.value) === -1;
  });

  const filteredOptions = filterOptions(possibleOptions, term, false);
  function appendSelected(o: Option) {
    setTerm('');
    const newVal = [...currentOptions, o];
    setCurrentOptions(newVal);
  }

  useSearchMenuKeydown({
    options: filteredOptions,
    containerEl: wrapperRef.current,
    focusedIdx,
    setFocusedIdx,
    onKeydownSelect: appendSelected,
    disabled: !isOpen || disabled
  });

  return (
    <section className={styles.wrapper} ref={wrapperRef}>
      <ul>
        {currentOptions.map(o => {
          return <li key={o.value}>{o.label}</li>;
        })}
      </ul>

      <input
        autoComplete="off"
        type="text"
        id="in-book"
        ref={triggerRef}
        className={classnames(
          'text-input text-input-small text-input-stretch',
          styles.input
        )}
        value={term}
        disabled={disabled}
        onChange={e => {
          const val = e.target.value;

          setTerm(val);
        }}
        onFocus={() => {
          setIsOpen(true);
        }}
        onBlur={() => {
          setTerm('');
          setIsOpen(false);
        }}
      />

      <PopoverContent
        contentId="advanced-search-panel-book-list"
        onDismiss={() => {
          setIsOpen(false);
        }}
        alignment="left"
        direction="bottom"
        triggerEl={triggerRef.current}
        wrapperEl={wrapperRef.current}
        contentClassName={classnames(styles['suggestion-wrapper'], {
          [styles['suggestions-wrapper-shown']]: isOpen
        })}
        closeOnOutsideClick
        closeOnEscapeKeydown
      >
        <ul
          className={classnames(styles['suggestion'], 'list-unstyled')}
          ref={listRef}
        >
          {filteredOptions.map((o, idx) => {
            const isFocused = idx === focusedIdx;

            return (
              <li
                key={o.value}
                className={classnames(styles['suggestion-item'], {})}
                ref={el => {
                  if (isFocused) {
                    setFocusedOptEl(el);
                  }
                }}
              >
                <button
                  type="button"
                  className={classnames(
                    'button-no-ui',
                    styles['suggestion-item-button'],
                    {
                      [styles['suggestion-item-focused']]: isFocused
                    }
                  )}
                  onClick={() => {
                    appendSelected(o);
                  }}
                >
                  {o.label}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </section>
  );
};

export default MultiSelect;
