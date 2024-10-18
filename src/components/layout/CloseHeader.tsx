import React from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { useNavigate } from 'react-router-dom';

interface CloseHeaderProps {
  onAction: () => void;
  type: 'close' | 'back';
  fallbackPath?: string;  // Add this line
}

const CloseHeader: React.FC<CloseHeaderProps> = ({ onAction, type, fallbackPath }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (fallbackPath) {
      navigate(fallbackPath);
    } else {
      onAction();
    }
  };

  return (
    <div className="flex items-center justify-between bg-neutral-900 border-b border-neutral-800 p-4">
      <Button 
        onClick={handleAction}
        className="bg-transparent text-neutral-300 hover:text-neutral-200 hover:bg-neutral-800 active:bg-neutral-700 active:text-neutral-100"
      >
        {type === 'back' ? <ChevronLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </Button>

      <div className="w-5 h-5" />
    </div>
  );
};

export default CloseHeader;