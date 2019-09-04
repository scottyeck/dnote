import React from 'react';
import { Switch, Route } from 'react-router';

import {
  ClassicMigrationSteps,
  getClassicMigrationPath
} from '../../libs/paths';
import ClassicLogin from './Login';
import ClassicSetPassword from './SetPassword';
import ClassicDecrypt from './Decrypt';

interface Props {}

const Classic: React.SFC<Props> = () => {
  return (
    <div className="container page">
      <Switch>
        <Route
          path={getClassicMigrationPath(ClassicMigrationSteps.login)}
          exact
          component={ClassicLogin}
        />
        <Route
          path={getClassicMigrationPath(ClassicMigrationSteps.setPassword)}
          exact
          component={ClassicSetPassword}
        />
        <Route
          path={getClassicMigrationPath(ClassicMigrationSteps.decrypt)}
          exact
          component={ClassicDecrypt}
        />
      </Switch>
    </div>
  );
};

export default Classic;
