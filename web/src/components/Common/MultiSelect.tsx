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
import { useSearchMenuKeydown, useScrollToFocused } from 'web/libs/hooks/dom';
import { useSelector } from '../../store';
import PopoverContent from '../Common/Popover/PopoverContent';
import CloseIcon from '../Icons/Close';
import { usePrevious } from 'web/libs/hooks';
import styles from './MultiSelect.scss';

interface Props {
  options: Option[];
  currentOptions: Option[];
  setCurrentOptions: (Option) => void;
  disabled?: boolean;
  textInputId?: string;
}

// TODO: Make a generic Select component that works for both single and multiple selection
// by passing of a flag
const MultiSelect: React.SFC<Props> = ({
  options,
  currentOptions,
  setCurrentOptions,
  textInputId,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(true);
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

  function appendOption(o: Option) {
    setTerm('');
    const newVal = [...currentOptions, o];
    setCurrentOptions(newVal);
  }
  function removeOption(o: Option) {
    setTerm('');
    const newVal = currentOptions.filter(opt => {
      return opt.value !== o.value;
    });
    setCurrentOptions(newVal);
  }

  useSearchMenuKeydown({
    options: filteredOptions,
    containerEl: wrapperRef.current,
    focusedIdx,
    setFocusedIdx,
    onKeydownSelect: appendOption,
    disabled: !isOpen || disabled
  });
  useScrollToFocused({
    shouldScroll: true,
    focusedOptEl,
    containerEl: listRef.current
  });

  useEffect(() => {
    if (!isOpen) {
      triggerRef.current.blur();
      console.log('active', document.activeElement);
    }
  }, [isOpen]);

  const textInputWidth = 14 + term.length * 4;

  return (
    <div
      className={classnames('form-select', styles.wrapper)}
      ref={wrapperRef}
      onClick={() => {
        if (triggerRef.current) {
          triggerRef.current.focus();
        }
      }}
    >
      <ul className={styles['current-options']}>
        {currentOptions.map(o => {
          return (
            <li className={styles['current-option-item']} key={o.value}>
              <div className={styles['current-option-label']}>{o.label}</div>
              <button
                type="button"
                className={classnames('button-no-ui', styles['dismiss-option'])}
                aria-label="Remove the option"
                onClick={() => {
                  removeOption(o);
                }}
              >
                <CloseIcon width={12} height={12} />
              </button>
            </li>
          );
        })}
        <li className={styles['input-wrapper']}>
          <input
            autoComplete="off"
            type="text"
            id={textInputId}
            ref={triggerRef}
            className={styles.input}
            value={term}
            disabled={disabled}
            onChange={e => {
              const val = e.target.value;

              setTerm(val);
            }}
            onFocus={() => {
              setIsOpen(true);
            }}
            onBlur={e => {
              if (listRef.current.contains(e.relatedTarget)) {
                console.log('containes', listRef.current, e.relatedTarget);
                return;
              }
              setIsOpen(false);
            }}
            style={{
              width: `${textInputWidth}px`
            }}
          />
        </li>
      </ul>

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
                  tabIndex={-1}
                  className={classnames(
                    'button-no-ui',
                    styles['suggestion-item-button'],
                    {
                      [styles['suggestion-item-focused']]: isFocused
                    }
                  )}
                  onClick={() => {
                    appendOption(o);
                  }}
                >
                  {o.label}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </div>
  );
};

export default MultiSelect;