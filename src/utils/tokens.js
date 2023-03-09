import BN from 'bignumber.js'
import { useChainInfoStore } from 'src/stores/chainInfo'
import { useAssetsStore } from 'src/stores/assets'

export function toBaseToken (val, exp, precision = 4) {
  const value = (new BN(val).div(new BN(10).pow(exp))).toFormat(precision)
  return value
}

export function formatToken (symbol, amount, precision) {
  const chainInfoStore = useChainInfoStore()
  const assetsStore = useAssetsStore()

  if (symbol === 'TDFY') {
    // handle TDFY
    const token = chainInfoStore.chainInfo.tokens.find((token) => token.symbol === symbol)
    if (token) {
      const decimals = parseInt(token.decimals, 10)
      return toBaseToken(amount, decimals, precision || decimals)
    }
  }
  else {
    // handle all other assets
    const token = assetsStore.assets.find((token) => token.symbol === symbol)
    if (token) {
      const decimals = parseInt(token.decimal, 10)
      return toBaseToken(amount, decimals, precision || decimals)
    }
  }
  return ''
}
