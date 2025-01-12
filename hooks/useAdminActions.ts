import { useState } from 'react'
import { useContractWrite } from 'wagmi'
import { TokenPoolABI } from '@/config/abis'
import { CONTRACTS } from '@/config/contracts'

export function useAdminActions(chainId: number) {
  const [isUpdatingFee, setIsUpdatingFee] = useState(false)
  const [feeUpdateSuccess, setFeeUpdateSuccess] = useState(false)

  const { writeAsync: updateFee } = useContractWrite({
    address: CONTRACTS.tokenPool[chainId as keyof typeof CONTRACTS.tokenPool],
    abi: TokenPoolABI,
    functionName: 'setFeePercentage',
  })

  const setNewFeePercentage = async (newFee: number) => {
    setIsUpdatingFee(true)
    setFeeUpdateSuccess(false)
    try {
      const tx = await updateFee({ args: [newFee] })
      await tx.wait()
      setFeeUpdateSuccess(true)
    } catch (error) {
      console.error('Error updating fee:', error)
      throw error
    } finally {
      setIsUpdatingFee(false)
    }
  }

  return {
    setNewFeePercentage,
    isUpdatingFee,
    feeUpdateSuccess,
  }
}

