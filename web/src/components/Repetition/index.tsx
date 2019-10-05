import React, { useState, useEffect } from 'react';
import Helmet from 'react-helmet';

import { getDigestRules } from '../../store/digestRules';
import { useDispatch } from '../../store';
import CreateModal from './CreateModal';

const Repetition: React.FunctionComponent = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getDigestRules());
  }, [dispatch]);

  return (
    <div className="page page-mobile-full">
      <Helmet>
        <title>Repetition</title>
      </Helmet>

      <div className="container mobile-fw">
        <div className="page-header">
          <h1 className="page-heading">Repetition</h1>
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

export default Repetition;
