import { useState, useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useConnectModal } from '@rainbow-me/rainbowkit'

const ADMIN_ADDRESS = '0x4368f5Aa973D252080d356ea0057C9f7aE1bf870'

export function useAdminAuth() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { openConnectModal } = useConnectModal()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!isConnected || !address) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      try {
        const message = `Verify admin access for ${address}`
        const signature = await signMessageAsync({ message })

        const response = await fetch('/api/verify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, signature, message }),
        })

        const data = await response.json()
        setIsAdmin(data.isAdmin)
      } catch (error) {
        console.error('Error verifying admin:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyAdmin()
  }, [address, isConnected, signMessageAsync])

  useEffect(() => {
    if (!isLoading && !isAdmin && router.pathname?.startsWith('/admin')) {
      if (!isConnected) {
        openConnectModal?.()
      } else {
        router.push('/')
      }
    }
  }, [isAdmin, isLoading, router, isConnected, openConnectModal])

  return { isAdmin, isLoading }
}

