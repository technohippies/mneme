import React from 'react';
import { Button } from '../ui/button';
import { Wallet } from "@phosphor-icons/react";

interface ConnectWalletButtonProps {
  onClick: () => void;
  isConnecting: boolean;
  isConnected: boolean;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  onClick,
  isConnecting,
  isConnected
}) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isConnecting}
      className="px-4 py-2"
    >
      <Wallet weight="fill" className="mr-2 h-4 w-4" />
      <span>
        {isConnecting ? 'Connecting...' : isConnected ? 'Initialize XMTP' : 'Connect Wallet'}
      </span>
    </Button>
  );
};
