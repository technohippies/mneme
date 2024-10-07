import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { base, mainnet } from 'wagmi/chains'

const projectId = '1874fe8ad6dc63fe3f91ca4e4a7ed1ba'

if (!projectId) {
  console.error('projectId is not set');
}

const metadata = {
  name: 'Anki Karaoke',
  description: 'Karaoke app with Web3 integration',
  url: 'https://roc.box/', // Replace with your website
  icons: ['https://roc.box/icon.png'] // Replace with your icon
}

const chains = [mainnet, base] as const

// Create wagmiConfig first
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// Then use wagmiConfig in createWeb3Modal
export const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId,
})