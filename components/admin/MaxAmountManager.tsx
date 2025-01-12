'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getMaxTransactionAmount, setMaxTransactionAmount } from '@/utils/contractInteractions'
import deploymentConfig from '@/tokenpool-deployment.json'

const pools = Object.keys(deploymentConfig.tokenPools)

export default function MaxAmountManager() {
  const [selectedPool, setSelectedPool] = useState(pools[0])
  const [maxAmount, setMaxAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMaxAmount()
  }, [selectedPool])

  const fetchMaxAmount = async () => {
    try {
      setLoading(true)
      setError(null)
      const amount = await getMaxTransactionAmount(selectedPool)
      setMaxAmount(amount.toString())
    } catch (error) {
      console.error('Error fetching max amount:', error)
      setMaxAmount('Error fetching')
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMaxAmount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      await setMaxTransactionAmount(selectedPool, maxAmount)
      console.log('Max amount updated successfully')
      await fetchMaxAmount()
    } catch (error) {
      console.error('Error updating max amount:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to update max amount. Please try again.')
      }
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Max Amount Per Swap</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <form onSubmit={handleUpdateMaxAmount} className="space-y-4">
            <div>
              <Label htmlFor="pool">Select Pool</Label>
              <Select value={selectedPool} onValueChange={setSelectedPool}>
                <SelectTrigger id="pool">
                  <SelectValue placeholder="Select pool" />
                </SelectTrigger>
                <SelectContent>
                  {pools.map((pool) => (
                    <SelectItem key={pool} value={pool}>
                      {pool.charAt(0).toUpperCase() + pool.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxAmount">Max Amount Per Swap</Label>
              <Input
                id="maxAmount"
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="Enter max amount per swap"
                required
              />
            </div>
            <Button type="submit">Update Max Amount</Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

