import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

interface WalletConnectionProps {
  className?: string;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ className = '' }) => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();

  const baseClassName = "text-white font-bold py-2 px-4 rounded";
  const fullClassName = `${baseClassName} ${className}`;

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className={`${fullClassName} bg-red-500 hover:bg-red-700`}
      >
        Disconnect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={() => open()}
      className={`${fullClassName} bg-blue-500 hover:bg-blue-700`}
    >
      Connect
    </button>
  );
};