<template>
  <span>{{ formatToken(symbol, amount, 4) }}<q-tooltip>{{ formatToken(symbol, amount) + ' ' + symbol }}</q-tooltip></span>
</template>

<script>
import { formatToken } from 'src/utils/tokens'

export default {
  name: 'TokenDisplay',

  props: {
    symbol: String,
    amount: String
  },

  setup () {
    return {
      formatToken
    }
  }
}
</script>
