import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useChainId, useSwitchChain } from 'wagmi'
import { NETWORKS } from '@/config/contracts'


export default function Header() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain() // Updated hook name
  const [selectedNetwork, setSelectedNetwork] = useState(Object.keys(NETWORKS)[0])

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network)
    const chainId = NETWORKS[network as keyof typeof NETWORKS].chainId
    switchChain?.(chainId) // Update call to use switchChain
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cross-Chain Swap</h1>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {selectedNetwork} <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.keys(NETWORKS).map((network) => (
                <DropdownMenuItem key={network} onClick={() => handleNetworkChange(network)}>
                  {network.charAt(0).toUpperCase() + network.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}