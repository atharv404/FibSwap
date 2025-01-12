'use client'

import { useState, useCallback } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { useTokenPool } from '@/hooks/useTokenPool'
import { NETWORKS, SUPPORTED_TOKENS } from '@/config/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

export function SwapForm() {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const { getFeeQuote, executeSwap } = useTokenPool()
  const { toast } = useToast()

  const [sourceChain, setSourceChain] = useState('ethereum')
  const [targetChain, setTargetChain] = useState('polygon')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState<{ baseFee: string; lzFee: string; totalFee: string } | null>(null)

  const handleGetQuote = useCallback(async () => {
    if (!amount || !chain) return

    try {
      const targetChainId = NETWORKS[targetChain as keyof typeof NETWORKS].lzChainId
      const recipientAddress = recipient || address

      if (!recipientAddress) {
        throw new Error('Recipient address is required')
      }

      const feeQuote = await getFeeQuote({
        amount,
        dstChainId: targetChainId,
        toAddress: recipientAddress
      })

      setQuote(feeQuote)
    } catch (error) {
      console.error('Error getting quote:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message
      })
    }
  }, [amount, chain, targetChain, recipient, address, getFeeQuote, toast])

  const handleSwap = async () => {
    if (!amount || !chain || !quote) return

    try {
      setIsLoading(true)

      const targetChainId = NETWORKS[targetChain as keyof typeof NETWORKS].lzChainId
      const recipientAddress = recipient || address
      const token = SUPPORTED_TOKENS.USDC.addresses[sourceChain as keyof typeof SUPPORTED_TOKENS.USDC.addresses]

      if (!recipientAddress) {
        throw new Error('Recipient address is required')
      }

      const tx = await executeSwap({
        dstChainId: targetChainId,
        toAddress: recipientAddress,
        token,
        amount
      })

      toast({
        title: "Swap Initiated",
        description: `Transaction Hash: ${tx.hash}`,
      })

      await tx.wait()

      toast({
        title: "Swap Confirmed",
        description: "Your tokens are on the way!",
      })

    } catch (error) {
      console.error('Swap failed:', error)
      toast({
        variant: "destructive",
        title: "Swap Failed",
        description: (error as Error).message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Source Chain</label>
          <Select value={sourceChain} onValueChange={setSourceChain}>
            <SelectTrigger>
              <SelectValue placeholder="Select source chain" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(NETWORKS).map((network) => (
                <SelectItem key={network} value={network}>
                  {network.charAt(0).toUpperCase() + network.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Target Chain</label>
          <Select value={targetChain} onValueChange={setTargetChain}>
            <SelectTrigger>
              <SelectValue placeholder="Select target chain" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(NETWORKS).filter(n => n !== sourceChain).map((network) => (
                <SelectItem key={network} value={network}>
                  {network.charAt(0).toUpperCase() + network.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Amount</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount to swap"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Recipient (optional)</label>
        <Input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Enter recipient address or leave blank for self"
        />
      </div>
      <Button onClick={handleGetQuote} disabled={!amount || isLoading}>
        Get Quote
      </Button>
      {quote && (
        <div className="space-y-2">
          <p>Base Fee: {quote.baseFee} USDC</p>
          <p>LayerZero Fee: {quote.lzFee} USDC</p>
          <p>Total Fee: {quote.totalFee} USDC</p>
        </div>
      )}
      <Button onClick={handleSwap} disabled={!quote || isLoading}>
        {isLoading ? 'Swapping...' : 'Swap'}
      </Button>
    </div>
  )
}

