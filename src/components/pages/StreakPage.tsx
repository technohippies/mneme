import React from 'react';
import CloseHeader from '../layout/CloseHeader';
import { useNavigate } from 'react-router-dom';

const StreakPage: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/'); // Navigate to the home page or wherever you want
  };

  return (
    <div>
      <CloseHeader onAction={handleClose} type="close" />
      {/* Rest of the component */}
      <h1>Streak Page</h1>
      {/* Add your streak-related content here */}
    </div>
  );
};

export default StreakPage;