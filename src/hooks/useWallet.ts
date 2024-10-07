import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useCallback, useEffect, useState } from 'react'
import { web3Modal } from '../utils/web3ModalSetup'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true)
      const connector = connectors[0] // Use the first available connector
      if (!connector) {
        throw new Error('No connectors available')
      }
      await connectAsync({ connector })
      web3Modal.open()
    } catch (error) {
      console.error('Failed to connect:', error)
    } finally {
      setIsConnecting(false)
    }
  }, [connectAsync, connectors])

  const disconnect = useCallback(async () => {
    try {
      await disconnectAsync()
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }, [disconnectAsync])

  useEffect(() => {
    if (isConnected) {
      web3Modal.close()
    }
  }, [isConnected])

  return {
    address,
    isConnected,
    isConnecting,
    connect,
    disconnect
  }
}