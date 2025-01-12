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
import { getPoolBalance, addLiquidity, removeLiquidity, getSupportedTokens } from '@/utils/contractInteractions'
import deploymentConfig from '@/tokenpool-deployment.json'

const pools = Object.keys(deploymentConfig.tokenPools)

export default function LiquidityManager() {
  const [selectedPool, setSelectedPool] = useState('')
  const [selectedToken, setSelectedToken] = useState('')
  const [amount, setAmount] = useState('')
  const [currentLiquidity, setCurrentLiquidity] = useState<Record<string, Record<string, string>>>({})
  const [supportedTokens, setSupportedTokens] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedPool) {
      setSupportedTokens(getSupportedTokens(selectedPool))
      fetchLiquidity(selectedPool)
    }
  }, [selectedPool])

  const fetchLiquidity = async (pool: string) => {
    try {
      setLoading(true)
      const tokens = getSupportedTokens(pool)
      const liquidity: Record<string, string> = {}
      for (const token of tokens) {
        const balance = await getPoolBalance(pool, token)
        liquidity[token] = balance.toString()
      }
      setCurrentLiquidity(prev => ({ ...prev, [pool]: liquidity }))
    } catch (error) {
      console.error('Error fetching liquidity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLiquidity = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addLiquidity(selectedPool, selectedToken, amount)
      console.log('Liquidity added successfully')
      await fetchLiquidity(selectedPool)
    } catch (error) {
      console.error('Error adding liquidity:', error)
    }
  }

  const handleRemoveLiquidity = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await removeLiquidity(selectedPool, selectedToken, amount)
      console.log('Liquidity removed successfully')
      await fetchLiquidity(selectedPool)
    } catch (error) {
      console.error('Error removing liquidity:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Liquidity</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
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
            <Label htmlFor="token">Select Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger id="token">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {supportedTokens.map((token) => (
                  <SelectItem key={token} value={token}>
                    {token}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" onClick={handleAddLiquidity}>Add Liquidity</Button>
            <Button type="submit" onClick={handleRemoveLiquidity} variant="destructive">Remove Liquidity</Button>
          </div>
        </form>
        <div className="mt-4">
          <h3 className="font-semibold">Current Liquidity</h3>
          {Object.entries(currentLiquidity).map(([pool, tokens]) => (
            <div key={pool}>
              <h4>{pool.charAt(0).toUpperCase() + pool.slice(1)}</h4>
              <ul>
                {Object.entries(tokens).map(([token, amount]) => (
                  <li key={token}>{token}: {amount}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

