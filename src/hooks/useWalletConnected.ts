import { useAccount } from 'wagmi';

export const useWalletConnected = () => {
  const { isConnected } = useAccount();
  return isConnected;
};