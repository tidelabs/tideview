<template>
  <div>{{  formatDateTimeInternational(timestamp) }}</div>
</template>

<script>
import { formatDateTimeInternational } from 'src/utils/time'

export default {
  name: 'DateTimeInternational',

  props: {
    // Needs to be ISO string. ex: '2023-02-09T14:14:12.000000Z'
    timestamp: String
  },

  setup () {
    return {
      formatDateTimeInternational
    }
  }
}
</script>
