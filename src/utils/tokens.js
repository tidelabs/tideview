import BN from 'bignumber.js'

export function toBaseToken (val, exp, precision = 4) {
  const value = (new BN(val).div(new BN(10).pow(exp))).toFormat(precision)
  return value
}
