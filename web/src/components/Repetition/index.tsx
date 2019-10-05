import React, { useState } from 'react';
import Helmet from 'react-helmet';

import CreateModal from './CreateModal';

const Repetition: React.FunctionComponent = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
