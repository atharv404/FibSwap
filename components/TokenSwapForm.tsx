'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getSupportedTokens, getTokenPoolContract } from '@/utils/contractInteractions'
import deploymentConfig from '@/tokenpool-deployment.json'

const supportedNetworks = Object.keys(deploymentConfig.tokenPools)

export default function TokenSwapForm() {
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('')
  const [sourceChain, setSourceChain] = useState('')
  const [destinationChain, setDestinationChain] = useState('')
  const [recipient, setRecipient] = useState('')
  const [supportedTokens, setSupportedTokens] = useState<string[]>([])

  useEffect(() => {
    if (sourceChain) {
      setSupportedTokens(getSupportedTokens(sourceChain))
    }
  }, [sourceChain])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceChain || !destinationChain || !token || !amount) return

    try {
      const contract = await getTokenPoolContract(sourceChain)
      const tokenAddress = deploymentConfig.tokenPools[sourceChain][token.toLowerCase()]
      const destinationChainId = deploymentConfig.tokenPools[destinationChain].lzChainId
      const amountWei = ethers.utils.parseUnits(amount, 6) // Assuming 6 decimals for USDC/USDT

      const tx = await contract.initiateSwap(
        tokenAddress,
        amountWei,
        destinationChainId,
        recipient || ethers.constants.AddressZero
      )
      await tx.wait()
      console.log('Swap initiated successfully')
    } catch (error) {
      console.error('Error initiating swap:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="sourceChain">Source Chain</Label>
        <Select value={sourceChain} onValueChange={setSourceChain}>
          <SelectTrigger id="sourceChain">
            <SelectValue placeholder="Select source chain" />
          </SelectTrigger>
          <SelectContent>
            {supportedNetworks.map((network) => (
              <SelectItem key={network} value={network}>
                {network.charAt(0).toUpperCase() + network.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="token">Token</Label>
        <Select value={token} onValueChange={setToken}>
          <SelectTrigger id="token">
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            {supportedTokens.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
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
      <div>
        <Label htmlFor="destinationChain">Destination Chain</Label>
        <Select value={destinationChain} onValueChange={setDestinationChain}>
          <SelectTrigger id="destinationChain">
            <SelectValue placeholder="Select destination chain" />
          </SelectTrigger>
          <SelectContent>
            {supportedNetworks.filter(n => n !== sourceChain).map((network) => (
              <SelectItem key={network} value={network}>
                {network.charAt(0).toUpperCase() + network.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="recipient">Recipient (optional)</Label>
        <Input
          id="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter recipient address or leave blank for self"
        />
      </div>
      <Button type="submit">Initiate Swap</Button>
    </form>
  )
}

