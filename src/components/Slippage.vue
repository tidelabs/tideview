<template>
  <div>{{ value }}%</div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Slippage',

  props: {
    amount: Number
  },

  setup (props) {
    const value = computed(() => props.amount / 1000)

    return {
      value
    }
  }
}
</script>
