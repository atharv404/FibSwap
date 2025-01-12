'use client'

import { usePoolBalance } from '@/hooks/useTokenPoolContract'
import { NETWORKS } from '@/config/contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PoolBalances() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(NETWORKS).map(([network, config]) => (
        <Card key={network}>
          <CardHeader>
            <CardTitle>{config.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <PoolBalance 
              token={config.tokens.USDC.address} 
              chainId={config.chainId} 
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PoolBalance({ token, chainId }: { token: string; chainId: number }) {
  const { balance, isLoading, isError } = usePoolBalance({ token, chainId })

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error fetching balance</div>

  return (
    <div className="text-2xl font-mono">
      {balance} USDC
    </div>
  )
}

