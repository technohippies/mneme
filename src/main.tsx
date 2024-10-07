import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer'
import './polyfills'
import App from './App'
import './styles/global.css'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from './services/walletConnectService'
import { AuthProvider } from './contexts/AuthContext'
import './i18n' // This should be before the App import

// Define Buffer globally
window.Buffer = window.Buffer ?? Buffer

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <App />
          </Suspense>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)