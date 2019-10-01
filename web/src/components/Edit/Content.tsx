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
import { RouteComponentProps } from 'react-router-dom';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom';

import operations from 'web/libs/operations';
import { getNotePath, notePathDef } from 'web/libs/paths';
import { useCleanupEditor, useFocusTextarea } from 'web/libs/hooks/editor';
import Editor from '../Common/Editor';
import { useDispatch, useSelector } from '../../store';
import { createBook } from '../../store/books';
import { setMessage } from '../../store/ui';
import styles from '../New/New.scss';

interface Props extends RouteComponentProps {
  noteUUID: string;
  setErrMessage: React.Dispatch<string>;
}

const Edit: React.SFC<Props> = ({ noteUUID, history, setErrMessage }) => {
  const { prevLocation } = useSelector(state => {
    return {
      prevLocation: state.route.prevLocation
    };
  });
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useFocusTextarea(textareaRef.current);
  useCleanupEditor();

  return null;
};

export default React.memo(withRouter(Edit));
