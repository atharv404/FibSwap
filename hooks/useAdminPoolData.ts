import { useState, useEffect } from 'react'
import { useContractReads } from 'wagmi'
import { TokenPoolABI } from '@/config/abis'
import { NETWORKS, CONTRACTS } from '@/config/contracts'

type PoolStats = {
  network: string
  balance: string
  totalVolume: string
  feeCollected: string
  transactions: number
}

export function useAdminPoolData() {
  const [stats, setStats] = useState<PoolStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const contracts = Object.entries(CONTRACTS.tokenPool).map(([network, address]) => ({
    address,
    abi: TokenPoolABI,
    functionName: 'getPoolStats',
  }))

  const { data, isError, refetch } = useContractReads({
    contracts,
  })

  useEffect(() => {
    if (data) {
      const formattedStats = data.map((result, index) => {
        const [network] = Object.entries(CONTRACTS.tokenPool)[index]
        const [balance, totalVolume, feeCollected, transactions] = result.result as [bigint, bigint, bigint, bigint]
        return {
          network,
          balance: balance.toString(),
          totalVolume: totalVolume.toString(),
          feeCollected: feeCollected.toString(),
          transactions: Number(transactions),
        }
      })
      setStats(formattedStats)
      setIsLoading(false)
    }
  }, [data])

  useEffect(() => {
    if (isError) {
      setError(new Error('Failed to fetch pool statistics'))
      setIsLoading(false)
    }
  }, [isError])

  return { stats, isLoading, error, refetch }
}

