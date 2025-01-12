'use client'

import { useAdminPoolData } from '@/hooks/useAdminPoolData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export function PoolStats() {
  const { stats, isLoading, error, refetch } = useAdminPoolData()

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600">Failed to load pool statistics</p>
        <Button variant="outline" onClick={refetch}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {isLoading ? (
        Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-[100px] mb-4" />
              <Skeleton className="h-8 w-[150px]" />
            </CardContent>
          </Card>
        ))
      ) : (
        stats.map((stat) => (
          <Card key={stat.network}>
            <CardHeader>
              <CardTitle>{stat.network.toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-mono">{stat.balance} USDC</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-mono">{stat.totalVolume} USDC</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fees Collected</p>
                <p className="text-2xl font-mono">{stat.feeCollected} USDC</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-mono">{stat.transactions}</p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

