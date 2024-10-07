import React, { useMemo } from 'react';
import { DeckType, FlashcardStatus } from '../../types';

interface DeckWithLearningStatusProps {
  deck: DeckType;
  status: FlashcardStatus;
  onClick?: () => void;
}

const DeckWithLearningStatus: React.FC<DeckWithLearningStatusProps> = ({ deck, status, onClick }) => {
  const imageSrc = useMemo(() => {
    if (deck.img_cid) {
      return `https://warp.dolpin.io/ipfs/${deck.img_cid}`;
    }
    return '/images/placeholder.png';
  }, [deck.img_cid]);

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
  };

  return (
    <div 
      onClick={onClick}
      className="block mb-4 bg-neutral-800 hover:bg-neutral-700 rounded-md overflow-hidden shadow-sm"
    >
      <div className="flex items-center p-3 relative">
        <img
          src={imageSrc}
          alt={deck.name}
          className="w-12 h-12 bg-neutral-600 rounded-lg overflow-hidden object-cover mr-1"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = "/images/placeholder.png";
          }}
        />
        <div className="flex-grow ml-2">
          <h2 className="text-lg font-semibold mr-32 truncate">
            {truncateTitle(deck.name, 12)}
          </h2>
        </div>
        <div className="absolute right-28 w-10 text-center text-lg font-medium">{status.new_count}</div>
        <div className="absolute right-16 w-10 text-center text-lg font-medium">{status.learning_count}</div>
        <div className="absolute right-4 w-10 text-center text-lg font-medium">{status.due_count}</div>
      </div>
    </div>
  );
};

export default React.memo(DeckWithLearningStatus);