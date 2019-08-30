import React from 'react';
import { Link } from 'react-router-dom';

import { SettingSections, getSettingsPath } from '../../libs/paths';
import styles from './Sidebar.scss';

interface Props {}

const Sidebar: React.SFC<Props> = () => {
  return (
    <nav className={styles.wrapper}>
      <ul>
        <li>
          <Link to={getSettingsPath(SettingSections.account)}>Account</Link>
        </li>
        <li>
          <Link to={getSettingsPath(SettingSections.email)}>Email</Link>
        </li>
        <li>
          <Link to={getSettingsPath(SettingSections.billing)}>Billing</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
