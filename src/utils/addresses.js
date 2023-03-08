import { decodeAddress, encodeAddress } from '@polkadot/keyring'
import { hexToU8a, isHex } from '@polkadot/util'

/**
 *
 * @param {String} hash
 * @param {*} length
 * @returns
 */
export function trimHash (hash, length) {
  if (!hash || hash.length < length) {
    return hash
  }

  const side = ((length - 2) / 2) | 0

  return hash.substr(0, side) + '..' + hash.substr(-side, side)
}

export const isValidAddress = (address) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  }
  catch (error) {
    return false
  }
}
