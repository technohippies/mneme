import React from 'react';
import { FlashcardStatus } from '../../types';
import { superballs } from 'ldrs';

interface FlashcardStatusDisplayProps {
  status: FlashcardStatus | null;
  isLoading: boolean;
}

const FlashcardStatusDisplay: React.FC<FlashcardStatusDisplayProps> = ({ status, isLoading }) => {
  React.useEffect(() => {
    superballs.register();
  }, []);

  const renderValue = (value: number | undefined) => {
    if (isLoading) {
      return (
        <l-superballs
          size="20"
          speed="1.4"
          color="#DC143C"
        ></l-superballs>
      );
    }
    return value ?? 0;
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-neutral-800 p-4 rounded-lg">
        <h2 className="text-neutral-300 text-md font-semibold mb-2">New</h2>
        <p className="text-neutral-200 text-2xl font-bold">{renderValue(status?.new_count)}</p>
      </div>
      <div className="bg-neutral-800 p-4 rounded-lg">
        <h2 className="text-neutral-300 text-md font-semibold mb-2">Learning</h2>
        <p className="text-neutral-200 text-2xl font-bold">{renderValue(status?.learning_count)}</p>
      </div>
      <div className="bg-neutral-800 p-4 rounded-lg">
        <h2 className="text-neutral-300 text-md font-semibold mb-2">Due</h2>
        <p className="text-neutral-200 text-2xl font-bold">{renderValue(status?.due_count)}</p>
      </div>
    </div>
  );
};

export default FlashcardStatusDisplay;