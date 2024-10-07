import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { mapDetectedLanguage } from '../config/languages';
import { useAuthenticateCeramic } from '../services/orbis/authService';
import { Client } from '@xmtp/xmtp-js';
import useEthersWalletClient from '../hooks/useEthersWalletClient';

interface User {
  address: string;
  did: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  setLanguage: (lang: string) => void;
  login: () => Promise<void>;
  authenticateCeramic: () => Promise<any>;
  xmtpClient: Client | null;
  initializeXMTP: () => Promise<void>;
  isXmtpInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const [isXmtpInitialized, setIsXmtpInitialized] = useState(false);
  const { address, isConnected } = useAccount();
  const { i18n } = useTranslation();
  const authenticateCeramic = useAuthenticateCeramic();
  const { data: signer } = useEthersWalletClient();
  const xmtpInitializationPromise = useRef<Promise<void> | null>(null);

  const setLanguage = useCallback((lang: string) => {
    const mappedLang = mapDetectedLanguage(lang);
    console.log('Setting language to:', mappedLang);
    i18n.changeLanguage(mappedLang);
    localStorage.setItem('userLanguage', mappedLang);
  }, [i18n]);

  const initializeXMTP = useCallback(async () => {
    console.log('initializeXMTP called. Current state:', { xmtpClient, isXmtpInitialized });
    
    if (!signer) {
      console.log('No signer available. Aborting XMTP initialization.');
      return;
    }

    if (xmtpClient || isXmtpInitialized) {
      console.log('XMTP client already initialized. Skipping initialization.');
      return;
    }

    if (xmtpInitializationPromise.current) {
      console.log('XMTP initialization already in progress. Waiting for it to complete.');
      await xmtpInitializationPromise.current;
      return;
    }

    xmtpInitializationPromise.current = (async () => {
      try {
        console.log('Starting XMTP client initialization...');
        const client = await Client.create(signer, { env: 'dev' });
        console.log('XMTP client created successfully.');
        setXmtpClient(client);
        setIsXmtpInitialized(true);
        console.log('XMTP client initialization complete.');
      } catch (error) {
        console.error('Error initializing XMTP client:', error);
      } finally {
        xmtpInitializationPromise.current = null;
      }
    })();

    await xmtpInitializationPromise.current;
  }, [signer, xmtpClient, isXmtpInitialized]);

  const login = async () => {
    if (isConnected && address) {
      setIsAuthenticating(true);
      try {
        const session = await authenticateCeramic();
        console.log('Ceramic session:', session);
        if (session && typeof session === 'object') {
          let did: string | undefined;
          if ('did' in session) {
            if (typeof session.did === 'string') {
              did = session.did;
            } else if (session.did && typeof session.did === 'object' && 'id' in session.did) {
              did = session.did.id as string;
            }
          } else if ('user' in session && session.user && typeof session.user === 'object' && 'did' in session.user) {
            did = session.user.did as string;
          }
          console.log('Extracted DID:', did);
          if (did && address) {
            setUser({ address, did });
          } else {
            console.error('Failed to extract DID from session or address is missing');
          }
        } else {
          console.error('Failed to get valid session from Ceramic');
        }
      } catch (error) {
        console.error('Error during Ceramic authentication:', error);
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      login();
    } else {
      setUser(null);
      setXmtpClient(null);
    }
  }, [isConnected, address]);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('userLanguage');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    } else {
      const browserLang = navigator.language;
      setLanguage(browserLang);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isAuthenticated: !!user, 
      isAuthenticating, 
      setLanguage, 
      login, 
      authenticateCeramic,
      xmtpClient,
      initializeXMTP,
      isXmtpInitialized
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};