import { SwapForm } from '@/components/SwapForm'
import { PoolBalances } from '@/components/PoolBalances'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Swap Tokens</h2>
      <SwapForm />
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Pool Balances</h2>
        <PoolBalances />
      </div>
    </div>
  )
}

