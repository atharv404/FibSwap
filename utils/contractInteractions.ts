import { ethers } from 'ethers'
import tokenPoolABI from '@/abis/TokenPool.json'
import feeManagerABI from '@/abis/FeeManager.json'
import deploymentConfig from '@/tokenpool-deployment.json'

// Helper function to get contract instance
const getContract = (address: string, abi: any, signer: ethers.Signer) => {
  return new ethers.Contract(address, abi, signer)
}

// Check if Web3 is available
const isWeb3Available = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
}

// Get TokenPool contract for a specific chain
export const getTokenPoolContract = async (chainName: string) => {
  if (!isWeb3Available()) {
    throw new Error('Web3 is not available. Please connect a Web3 wallet.')
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const address = deploymentConfig.tokenPools[chainName].address
    console.log('TokenPool address for', chainName, ':', address)
    const contract = getContract(address, tokenPoolABI, signer)
    console.log('TokenPool contract instance created')
    return contract
  } catch (error) {
    console.error('Error getting TokenPool contract:', error)
    throw error
  }
}

// Get FeeManager contract
export const getFeeManagerContract = async () => {
  if (!isWeb3Available()) {
    throw new Error('Web3 is not available. Please connect a Web3 wallet.')
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const address = deploymentConfig.feeManager.address
  return getContract(address, feeManagerABI, signer)
}

// Fetch pool balance
export const getPoolBalance = async (chainName: string, token: string) => {
  const contract = await getTokenPoolContract(chainName)
  return contract.getPoolBalance(token)
}

// Fetch fees
export const getFees = async () => {
  try {
    const contract = await getFeeManagerContract()
    const baseFee = await contract.baseFee()
    const discountedFee = await contract.discountedFee()
    return { baseFee, discountedFee }
  } catch (error) {
    console.error('Error fetching fees:', error)
    throw error
  }
}

// Update fees
export const updateFees = async (baseFee: number, discountedFee: number) => {
  const contract = await getFeeManagerContract()
  const tx = await contract.setFees(baseFee, discountedFee)
  await tx.wait()
}

// Add liquidity
export const addLiquidity = async (chainName: string, token: string, amount: string) => {
  const contract = await getTokenPoolContract(chainName)
  const tx = await contract.addLiquidity(token, ethers.utils.parseUnits(amount, 6))
  await tx.wait()
}

// Remove liquidity
export const removeLiquidity = async (chainName: string, token: string, amount: string) => {
  const contract = await getTokenPoolContract(chainName)
  const tx = await contract.removeLiquidity(token, ethers.utils.parseUnits(amount, 6))
  await tx.wait()
}

// Get max transaction amount
export const getMaxTransactionAmount = async (chainName: string) => {
  try {
    const contract = await getTokenPoolContract(chainName)
    const maxAmount = await contract.maxTransactionAmount()
    console.log('Max transaction amount:', maxAmount.toString())
    return maxAmount
  } catch (error) {
    console.error('Error fetching max transaction amount:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw error
  }
}

// Set max transaction amount
export const setMaxTransactionAmount = async (chainName: string, amount: string) => {
  const contract = await getTokenPoolContract(chainName)
  const tx = await contract.setMaxTransactionAmount(ethers.utils.parseUnits(amount, 6))
  await tx.wait()
}

// Helper function to get supported tokens for a chain
export const getSupportedTokens = (chainName: string) => {
  const chainConfig = deploymentConfig.tokenPools[chainName]
  const tokens = []
  if (chainConfig.usdc) tokens.push('USDC')
  if (chainConfig.usdt) tokens.push('USDT')
  return tokens
}

