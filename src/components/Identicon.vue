<template>
  <q-btn
    flat
    padding="0"
    @click="copyAddress"
  >
    <div
      v-html="identicon"
      class="border-light identity-svg-wrapper"
    />
    <q-tooltip>Click to copy address</q-tooltip>
  </q-btn>
</template>

<script>
import { toSvg } from 'jdenticon'
import { computed } from 'vue'
import { copyToClipboard, useQuasar } from 'quasar'

export default {
  name: 'Identicon',
  props: {
    address: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const $q = useQuasar()

    const identicon = computed(() => toSvg(props.address, 20))

    function copyAddress () {
      copyToClipboard(props.address)
        .then(() => {
          // success!
          $q.notify({
            message: 'Address copied to clipboard!',
            position: 'top-right'
          })
        })
        .catch(() => {
          // fail
        })
    }

    return {
      identicon,
      copyAddress
    }
  }
}
</script>

<style lang="scss">
.border-light {
  border: solid 1px rgba(0,0,0,0.2);
  border-radius: 2px;
}

.q-dark div,
.body--dark div {
  .border-light {
    border: solid 1px rgba(255,255,255,0.2);
  }
}

.identity-svg-wrapper {
  max-width: 22px;
  max-height: 22px;
  cursor: copy;
}

</style>
