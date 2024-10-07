// src/services/orbis/authService.ts

import { OrbisEVMAuth } from "@useorbis/db-sdk/auth";
import { db, logCeramicConnectionStatus } from "./config";
import { useWeb3Provider } from "../walletConnectService";
import useEthersWalletClient from '../../hooks/useEthersWalletClient';

export const useAuthenticateCeramic = () => {
  const { isConnected } = useWeb3Provider();
  const { data: walletClient } = useEthersWalletClient();

  const authenticateCeramic = async () => {
    try {
      const isCeramicConnected = await db.isUserConnected();

      if (isCeramicConnected) {
        const connectedUser = await db.getConnectedUser();
        return connectedUser;
      }

      const serializedSession = localStorage.getItem('orbis_session');
      if (serializedSession) {
        const session = await db.connectUser({ serializedSession });
        if (session) {
          return session;
        }
      }

      if (!isConnected) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }

      if (!walletClient) {
        throw new Error("Failed to get wallet client. Make sure your wallet is connected.");
      }

      const auth = new OrbisEVMAuth(walletClient as any);
      const session = await db.connectUser({ auth: auth as any, saveSession: true });

      if (session) {
        const address = await walletClient.getAddress();
        localStorage.setItem('walletAddress', address);

        await logCeramicConnectionStatus();
        return session;
      } else {
        throw new Error("Failed to authenticate with Ceramic");
      }
    } catch (error) {
      console.error('Error authenticating with Ceramic:', error);
      throw error;
    }
  };

  return authenticateCeramic;
};