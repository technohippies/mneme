import React from 'react';
import { useTranslation } from 'react-i18next';

interface ScoreDisplayProps {
  score: number | undefined;
  isProcessing: boolean;
  error: string | null;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, isProcessing, error }) => {
  const { t } = useTranslation();

  if (isProcessing) {
    return (
      <div className="score-display flex flex-col items-center justify-center rounded-full w-32 h-16">
        <h3 className="text-sm text-white">{t('scoreDisplay.processing')}</h3>
        <p className="score text-3xl font-bold text-white">...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="score-display flex items-center justify-center rounded-full w-32 h-16">
        <p className="score text-xs font-bold text-white text-center px-1">{error}</p>
      </div>
    );
  }

  if (typeof score !== 'number' || isNaN(score)) {
    return (
      <div className="score-display flex flex-col items-center justify-center rounded-full w-32 h-16">
        <h3 className="text-sm text-white">{t('scoreDisplay.unavailable')}</h3>
        <p className="score text-3xl font-bold text-white">-</p>
      </div>
    );
  }

  return (
    <div className="score-display flex flex-col items-center justify-center rounded-full w-32 h-16">
      <h3 className="text-sm text-white">{t('scoreDisplay.title')}</h3>
      <p className="score text-3xl font-bold text-white">{score.toFixed(2)}</p>
    </div>
  );
};