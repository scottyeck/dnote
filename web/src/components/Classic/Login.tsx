import React from 'react';
import { Redirect } from 'react-router-dom';

import { useSelector } from '../../store';
import {
  ClassicMigrationSteps,
  getClassicMigrationPath,
  getHomePath
} from '../../libs/paths';

interface Props {}

const ClassicLogin: React.SFC<Props> = () => {
  const { user } = useSelector(state => {
    return {
      user: state.auth.user
    };
  });

  if (!user.isFetched) {
    return <div>Loading</div>;
  }

  const userData = user.data;
  const loggedIn = userData.uuid !== '';

  if (loggedIn && !userData.encrypted) {
    return <Redirect to={getHomePath()} />;
  }

  if (loggedIn && userData.encrypted) {
    return (
      <Redirect
        to={getClassicMigrationPath(ClassicMigrationSteps.setPassword)}
      />
    );
  }

  return <div>ClassicLogin</div>;
};

export default ClassicLogin;
