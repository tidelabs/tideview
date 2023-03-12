<template>
  <a :href="tidechainExplorerUrl + blockNumber" target="_blank" class="external-link">
    {{ blockNumber }}<q-tooltip>Click to view on Tidefi Explorer</q-tooltip>
  </a>
</template>

<script>
import { tidechainExplorerUrl } from 'src/utils/constants'
export default {
  name: 'BlockNumber',

  props: {
    blockNumber: {
      type: Number || String,
      required: true
    }
  },

  setup () {
    return {
      tidechainExplorerUrl
    }
  }
}
</script>
