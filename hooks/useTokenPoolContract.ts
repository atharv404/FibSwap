import { useContractRead } from 'wagmi'
import { TokenPoolABI } from '@/config/abis'
import { NETWORKS, CONTRACTS } from '@/config/contracts'
import { formatUnits } from 'viem'

export function usePoolBalance({ token, chainId }: { token: string; chainId: number }) {
  const network = Object.entries(NETWORKS).find(([, config]) => config.chainId === chainId)?.[0]
  
  const { data, isLoading, isError } = useContractRead({
    address: CONTRACTS.tokenPool[network as keyof typeof CONTRACTS.tokenPool],
    abi: TokenPoolABI,
    functionName: 'getTokenBalance',
    args: [token],
    chainId,
  })

  return {
    balance: data ? formatUnits(data as bigint, 6) : '0', // Assuming USDC has 6 decimals
    isLoading,
    isError,
  }
}

