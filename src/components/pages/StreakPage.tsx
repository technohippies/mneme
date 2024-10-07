import React from 'react';
import { useNavigate } from 'react-router-dom';
import CloseHeader from '../layout/CloseHeader';

const StreakPage: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-neutral-300">
      <CloseHeader onClose={handleClose} />
      <div className="flex-grow p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Your Streak</h1>
        <p>Placeholder content for the Streak page.</p>
      </div>
    </div>
  );
};

export default StreakPage;