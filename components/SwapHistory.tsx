'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Swap = {
  id: string
  token: string
  amount: string
  destinationChain: string
  status: 'Pending' | 'Completed'
}

// This is a mock function. In a real application, you would fetch this data from your backend or by querying events from the blockchain.
const fetchSwapHistory = async (): Promise<Swap[]> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return [
    { id: '1', token: 'USDC', amount: '100', destinationChain: 'Polygon', status: 'Completed' },
    { id: '2', token: 'USDT', amount: '200', destinationChain: 'BSC', status: 'Pending' },
  ]
}

export default function SwapHistory() {
  const [swaps, setSwaps] = useState<Swap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchSwapHistory()
      .then(setSwaps)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Swap History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading swap history...</p>
        ) : swaps.length === 0 ? (
          <p>No swap history found.</p>
        ) : (
          <ul className="space-y-2">
            {swaps.map((swap) => (
              <li key={swap.id} className="flex justify-between items-center">
                <span>{swap.amount} {swap.token} to {swap.destinationChain}</span>
                <span className={swap.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}>
                  {swap.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

