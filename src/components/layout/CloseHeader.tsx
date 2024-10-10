import React from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { Button } from "../../components/ui/button";

interface CloseHeaderProps {
  onAction: () => void;
  title?: string;
  type: 'close' | 'back';
}

const CloseHeader: React.FC<CloseHeaderProps> = ({ onAction, title, type }) => {
  return (
    <div className="flex items-center justify-between bg-neutral-900 border-b border-neutral-800 p-4">
      <Button 
        onClick={onAction}
        className="bg-transparent text-neutral-300 hover:text-neutral-200 hover:bg-neutral-800 active:bg-neutral-700 active:text-neutral-100"
      >
        {type === 'back' ? <ChevronLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </Button>
      {title && <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>}
      <div className="w-5 h-5" />
    </div>
  );
};

export default CloseHeader;