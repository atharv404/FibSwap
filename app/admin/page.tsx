'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FeeManager } from '@/components/admin/FeeManager'
import { PoolStats } from '@/components/admin/PoolStats'
import { NETWORKS } from '@/config/contracts'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Spinner } from '@/components/ui/spinner'

export default function AdminDashboard() {
  const mainnetChainId = NETWORKS.ethereum.chainId
  const { isAdmin, isLoading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="space-y-8">
        <PoolStats />
        <FeeManager chainId={mainnetChainId} />
      </div>
    </div>
  )
}

