import tokenPoolDeployment from '@/tokenpool-deployment.json'

export const getTokenPoolAddress = (network: string) => {
  return tokenPoolDeployment.tokenPools[network]?.address
}

export const getSupportedTokens = (network: string) => {
  const pool = tokenPoolDeployment.tokenPools[network]
  return [pool?.usdc, pool?.usdt].filter(Boolean).map(addr => addr === pool.usdc ? 'usdc' : 'usdt')
}

export const getChainId = (network: string) => {
  return tokenPoolDeployment.tokenPools[network]?.lzChainId
}

