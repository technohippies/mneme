import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { base, mainnet } from 'viem/chains'
import { IEVMProvider } from '@useorbis/db-sdk/dist/types/providers'
import { useAccount, useWalletClient } from 'wagmi'

const projectId = '1874fe8ad6dc63fe3f91ca4e4a7ed1ba'

const metadata = {
  name: 'Anki Karaoke',
  description: 'Karaoke app with Web3 integration',
  url: 'https://roc.box/',
  icons: ['https://roc.box/icon.png']
}

const chains = [mainnet, base] as const

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

export const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId,
})

export function useWeb3Provider() {
  const { isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  const getWeb3Provider = async (): Promise<IEVMProvider | null> => {
    try {
      console.log('Getting Web3 provider...');
      if (!isConnected) {
        console.error('No account connected');
        return null;
      }

      console.log('Wallet client obtained:', walletClient);

      if (!walletClient) {
        console.error('No wallet client found');
        return null;
      }

      // Create a provider that matches the interface expected by OrbisEVMAuth
      const provider: IEVMProvider = {
        request: async ({ method, params }: { method: string; params?: any[] }) => {
          console.log('Provider request:', method, params);
          return await walletClient.request({
            method: method as any,
            params: params as any
          });
        }
      };

      console.log('Web3 provider created successfully');
      return provider;
    } catch (error) {
      console.error('Error getting Web3 provider:', error);
      return null;
    }
  };

  return { getWeb3Provider, isConnected };
}