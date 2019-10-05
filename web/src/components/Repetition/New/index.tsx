import React, { useState, useEffect } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import { getRepetitionsPath } from 'web/libs/paths';
import { getDigestRules } from '../../../store/repetitionRules';
import { useDispatch } from '../../../store';
import CreateModal from '../CreateModal';
import repetitionStyles from '../Repetition.scss';

const NewRepetition: React.FunctionComponent = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getDigestRules());
  }, [dispatch]);

  return (
    <div className="page page-mobile-full">
      <Helmet>
        <title>New Repetition</title>
      </Helmet>

      <div className="container mobile-fw">
        <div className={classnames('page-header', repetitionStyles.header)}>
          <h1 className="page-heading">New Repetition</h1>

          <Link to={getRepetitionsPath()}>Cancel</Link>
        </div>
      </div>

      <div className="container">content</div>

      <CreateModal
        isOpen={isCreateModalOpen}
        onDismiss={() => {
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default NewRepetition;
