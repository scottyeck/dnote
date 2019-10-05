import React, { useState } from 'react';
import Helmet from 'react-helmet';

import CreateModal from './CreateModal';

const Repetition: React.FunctionComponent = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(true);

  return (
    <div className="container page">
      <Helmet>
        <title>Repetition</title>
      </Helmet>

      <h1>Repetition</h1>

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
