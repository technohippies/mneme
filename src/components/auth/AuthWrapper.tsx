import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { WalletConnection } from '../composite/WalletConnection';
import { CeramicAuth } from './CeramicAuth';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isConnected } = useAccount();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsAuthenticated(isConnected);
  }, [isConnected]);

  if (!isAuthenticated) {
    return (
      <div className="relative flex flex-col min-h-screen bg-neutral-900 text-neutral-200">
        {/* Background image with darker overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/cover.png"
            alt={t('auth.scarlettImageAlt')}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900"></div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col flex-grow z-10">
          {/* Spacer to push content down */}
          <div className="flex-grow"></div>

          {/* Centered text content with improved readability */}
          <div className="flex flex-col items-center px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-center text-white shadow-text">
              {t('auth.meetScarlett')}
            </h1>
            <p className="text-xl md:text-2xl text-center mt-4 font-semibold text-gray-100 shadow-text">
              {t('auth.karaokeDescription')}
            </p>

            {/* Desktop button */}
            <div className="hidden md:block mt-12 w-full max-w-md z-20">
              <WalletConnection className="w-full" />
            </div>
          </div>

          {/* Spacer to adjust content position */}
          <div className="flex-grow"></div>
        </div>

        {/* Mobile button - remains sticky at the bottom */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-neutral-900 to-transparent z-20">
          <WalletConnection className="w-full" />
        </div>
      </div>
    );
  }

  return <CeramicAuth>{children}</CeramicAuth>;
};