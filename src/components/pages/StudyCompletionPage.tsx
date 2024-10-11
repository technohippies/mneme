import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CloseHeader from "../layout/CloseHeader";
import { phraseService } from "../../services/orbis/phraseService";
import { userLearningDataService } from "../../services/orbis/userDataLearningService";
import { getCurrentUserDID } from "../../services/orbis/config";
import { useAuthenticateCeramic } from "../../services/orbis/authService";
import { quantum } from "ldrs";
import { useTranslation } from "react-i18next";
import { motion } from 'framer-motion';
import loadingImage from '/images/loading-image.png';

quantum.register();

const StudyCompletionPage: React.FC = () => {
  const { geniusSlug } = useParams<{ geniusSlug: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  // Commenting out streak-related state and hooks
  // const [streakData, setStreakData] = useState<StreakData | null>(null);
  const authenticateCeramic = useAuthenticateCeramic();
  const { t } = useTranslation();
  // const { address } = useAccount();

  useEffect(() => {
    const ensureAllDataSaved = async () => {
      if (!geniusSlug) return;

      try {
        const [phrases, userDid] = await Promise.all([
          phraseService.getPhrasesByGeniusSlug(geniusSlug),
          getCurrentUserDID(),
        ]);

        if (userDid && phrases.length > 0) {
          const songUuid = phrases[0].song_uuid;
          await userLearningDataService.initializeUserLearningDataForSong(
            songUuid,
            userDid,
            authenticateCeramic
          );
        }

        // Commenting out streak data fetching
        // if (address) {
        //   const response = await fetch(`https://faint-vase-whispering.functions.on-fleek.app/combined-streak?address=${address}`);
        //   const data = await response.json();
        //   setStreakData(data);
        // }

        setIsLoading(false);
      } catch (error) {
        console.error("Error ensuring all data is saved:", error);
        setIsLoading(false);
      }
    };

    ensureAllDataSaved();
  }, [geniusSlug, authenticateCeramic]);

  const handleReturnToDeck = () => {
    navigate(`/deck/${geniusSlug}`);
  };

  const handleClose = () => {
    navigate(`/song/${geniusSlug}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-neutral-900 text-neutral-100">
        <CloseHeader onAction={handleClose} type="close" />
        <div className="flex-grow flex items-center justify-center">
          <motion.img 
            src={loadingImage} 
            alt="Loading" 
            className="w-48 h-48 object-contain"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen bg-neutral-900 text-neutral-100">
      {/* Background image with darker overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/celebrate.png"
          alt={t("studyCompletion.celebrateImageAlt")}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <CloseHeader onAction={handleClose} type="close" />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white shadow-text">
            Complete!
          </h1>
          <p className="mb-4 text-xl text-white shadow-text">
            Study 20 flashcards per day to get a streak.
          </p>
          <p className="mt-2 mb-8 text-xl text-white shadow-text">
            Keep a streak of 3+ for the weekly Pokémon raffle!
          </p>
        </div>

        {/* Button positioned at the bottom */}
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-neutral-900 to-transparent z-20">
          <button
            onClick={handleReturnToDeck}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Return to Deck
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyCompletionPage;
