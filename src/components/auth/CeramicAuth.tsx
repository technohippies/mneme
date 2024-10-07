import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';

interface CeramicAuthProps {
  children: React.ReactNode;
}

export const CeramicAuth: React.FC<CeramicAuthProps> = ({ children }) => {
  const [isOrbisConnected, setIsOrbisConnected] = useState(() => {
    return localStorage.getItem('isOrbisConnected') === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useAccount();
  const { authenticateCeramic, login } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    localStorage.setItem('isOrbisConnected', isOrbisConnected.toString());
  }, [isOrbisConnected]);

  const connectToOrbis = async () => {
    if (isConnected) {
      setIsLoading(true);
      setError(null);
      try {
        // Connect to Orbis
        const authResult = await authenticateCeramic();
        setIsOrbisConnected(!!authResult);
        console.log('Orbis Connection successful:', authResult);

        // Trigger a re-authentication in the AuthContext
        await login();
      } catch (error) {
        console.error('Error connecting:', error);
        setError(error instanceof Error ? error.message : 'Failed to connect. Please try again.');
        setIsOrbisConnected(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('No wallet connected. Please connect your wallet first.');
    }
  };

  if (!isOrbisConnected) {
    return (
      <div className="relative flex flex-col min-h-screen bg-neutral-900 text-neutral-200">
        {/* Background image with darker overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/cover-2.png"
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
              {t('auth.signToContinue')}
            </h1>
            <p className="text-xl md:text-2xl text-center mt-4 font-semibold text-gray-100 shadow-text">
              {t('auth.ceramicDescription')}
            </p>
            {error && <p className="text-red-500 mt-4">{error}</p>}

            {/* Desktop button */}
            <div className="hidden md:block mt-12 w-full max-w-md z-20">
              <Button
                onClick={connectToOrbis}
                disabled={isLoading}
                className="w-full text-white font-bold py-2 px-4 rounded bg-blue-500 hover:bg-blue-700"
              >
                {isLoading ? t('auth.signing') : t('auth.sign')}
              </Button>
            </div>
          </div>

          {/* Spacer to adjust content position */}
          <div className="flex-grow"></div>
        </div>

        {/* Mobile button - remains sticky at the bottom */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-neutral-900 to-transparent z-20">
          <Button
            onClick={connectToOrbis}
            disabled={isLoading}
            className="w-full text-white font-bold py-2 px-4 rounded bg-blue-500 hover:bg-blue-700"
          >
            {isLoading ? t('auth.signing') : t('auth.sign')}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};