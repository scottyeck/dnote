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

import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router-dom';

import Account from './Account';
import Notification from './Notification';
import Billing from './Billing';

import './Settings.scss';

enum Sections {
  account = 'account',
  email = 'email',
  billing = 'billing'
}

function renderContent(section: string): React.ReactNode {
  if (section === Sections.account) {
    return <Account />;
  }
  //  if (section === Sections.email) {
  //    return <Notification />;
  //  }
  //  if (section === Sections.billing) {
  //    return <Billing />;
  //  }

  return <div>Not found</div>;
}

interface Match {
  section: string;
}

interface Props extends RouteComponentProps<Match> {}

const Settings: React.SFC<Props> = ({ match }) => {
  const { params } = match;
  const { section } = params;

  return (
    <Fragment>
      <Helmet>
        <title>Settings</title>
        <meta name="description" content="Dnote settings" />
      </Helmet>

      {renderContent(section)}
    </Fragment>
  );
};

export default Settings;
