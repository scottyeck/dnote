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

import { AppState } from '../store';

/* localStorage keys */
export const stateKey = 'state';

// setObj stringifies the given value and stores the result under the given key
// in the localStorage
export function setObj(key: string, val: object) {
  try {
    const serialized = JSON.stringify(val);

    localStorage.setItem(key, serialized);
  } catch (e) {
    console.log('Unable save to the localStorage', e.message);
  }
}

// getObj reads a serialized object stored in the localStorage, parses it, and returns
// the result. If none is found, it returns undefined.
export function getObj(key: string) {
  try {
    const serialized = localStorage.getItem(key);

    if (serialized === null) {
      return undefined;
    }

    return JSON.parse(serialized);
  } catch (e) {
    console.log('Unable load state from the localStorage', e.message);
    return undefined;
  }
}

// loadState parses serialized state trees in the localStorage, combines them,
// and returns the resulting app state. If no state trees are found, it returns
// undefined.
export function loadState(): Partial<AppState> | undefined {
  return getObj(stateKey);
}
