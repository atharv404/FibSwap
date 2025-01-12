import { useCallback } from 'react'
import { useContractRead, useContractWrite, useAccount, useNetwork } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { TokenPoolABI, ERC20ABI } from '@/config/abis'
import { NETWORKS, CONTRACTS, SUPPORTED_TOKENS } from '@/config/contracts'

export function useTokenPool() {
  const { address } = useAccount()
  const { chain } = useNetwork()

  const getContractConfig = useCallback(() => {
    if (!chain) return null
    
    const network = Object.entries(NETWORKS).find(
      ([, config]) => config.chainId === chain.id
    )?.[0]
    
    if (!network) return null

    return {
      address: CONTRACTS.tokenPool[network as keyof typeof CONTRACTS.tokenPool],
      abi: TokenPoolABI
    }
  }, [chain])

  const getFeeQuote = useCallback(async ({
    amount,
    dstChainId,
    toAddress
  }: {
    amount: string
    dstChainId: number
    toAddress: string
  }) => {
    const contract = getContractConfig()
    if (!contract) throw new Error('Chain not supported')

    const parsedAmount = parseUnits(amount, 6) // USDC/USDT decimals

    const { data: baseFee } = await useContractRead({
      ...contract,
      functionName: 'calculateFee',
      args: [parsedAmount]
    })

    const { data: lzFee } = await useContractRead({
      ...contract,
      functionName: 'estimateSendFee',
      args: [BigInt(dstChainId), toAddress, parsedAmount, false, '0x']
    })

    return {
      baseFee: formatUnits(baseFee || 0n, 6),
      lzFee: formatUnits((lzFee?.[0] || 0n), 6),
      totalFee: formatUnits((baseFee || 0n) + (lzFee?.[0] || 0n), 6)
    }
  }, [getContractConfig])

  const checkAndApproveToken = useCallback(async ({
    token,
    amount
  }: {
    token: string
    amount: string
  }) => {
    if (!address) throw new Error('Wallet not connected')
    const contract = getContractConfig()
    if (!contract) throw new Error('Chain not supported')

    const parsedAmount = parseUnits(amount, 6)

    const { data: allowance } = await useContractRead({
      address: token,
      abi: ERC20ABI,
      functionName: 'allowance',
      args: [address, contract.address]
    })

    if ((allowance || 0n) < parsedAmount) {
      const { writeAsync: approve } = useContractWrite({
        address: token,
        abi: ERC20ABI,
        functionName: 'approve'
      })

      const tx = await approve({
        args: [contract.address, parsedAmount]
      })
      await tx.wait()
    }
  }, [address, getContractConfig])

  const executeSwap = useCallback(async ({
    dstChainId,
    toAddress,
    token,
    amount
  }: {
    dstChainId: number
    toAddress: string
    token: string
    amount: string
  }) => {
    const contract = getContractConfig()
    if (!contract || !address) throw new Error('Not ready')

    const parsedAmount = parseUnits(amount, 6)

    await checkAndApproveToken({ token, amount })

    const { data: [nativeFee] } = await useContractRead({
      ...contract,
      functionName: 'estimateSendFee',
      args: [BigInt(dstChainId), toAddress, parsedAmount, false, '0x']
    })

    const { writeAsync: sendTokens } = useContractWrite({
      ...contract,
      functionName: 'sendTokens'
    })

    const tx = await sendTokens({
      args: [
        BigInt(dstChainId),
        toAddress,
        token,
        parsedAmount,
        address, // refund address
        '0x0000000000000000000000000000000000000000', // zroPaymentAddress
        '0x' // adapterParams
      ],
      value: nativeFee // LayerZero fee in native token
    })

    return tx
  }, [address, getContractConfig, checkAndApproveToken])

  return {
    getFeeQuote,
    executeSwap
  }
}

