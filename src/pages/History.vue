<template>
  <q-page padding>
    <div class="row justify-center items-start full-width q-mb-lg q-gutter-lg">
      <q-input
        v-model="selectedAddress"
        label="Input an Address"
        outlined
        clearable
        :color="$q.dark.isActive ? 'yellow' : 'primary'"
        :rules="[val => isValidAddress(val) || 'Invalid address']"
        style="min-width: 300px;"
        class="ellipsis"
      />
    </div>

    <div class="q-gutter-y-md">
      <div v-if="selectedAddress" class="row items-center" >
        <identicon :address="selectedAddress" />
        <a :href="bondingEntityUrl + selectedAddress" target="_blank" class="external-link">
          <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(selectedAddress, 16) }}<q-tooltip>{{ selectedAddress }}</q-tooltip></span>
          <span v-else class="q-ml-sm">{{ selectedAddress }}</span>
        </a>
      </div>

      <Reward :account="selectedAddress" />
      <Swap :account="selectedAddress" />
      <Transfer :account="selectedAddress" />
      <Withdrawal :account="selectedAddress" />
      <Deposit :account="selectedAddress" />
      <Bond :account="selectedAddress" />
    </div>
</q-page>
</template>

<script>
import { ref, watch, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isValidAddress } from 'src/utils/addresses'
import { bondingEntityUrl } from 'src/utils/constants'

import Identicon from 'src/components/Identicon.vue'
import Reward from 'src/components/Reward.vue'
import Swap from 'src/components/Swap.vue'
import Transfer from 'src/components/Transfer.vue'
import Withdrawal from 'src/components/Withdrawal.vue'
import Deposit from 'src/components/Deposit.vue'
import Bond from 'src/components/Bond.vue'

export default {
  name: 'History',

  components: {
    Identicon,
    Reward,
    Swap,
    Transfer,
    Withdrawal,
    Deposit,
    Bond
  },

  setup () {
    const route = useRoute()
    const router = useRouter()
    const selectedAddress = ref(null)

    onBeforeMount(() => {
      if (route.params.address && isValidAddress(route.params.address)) {
        selectedAddress.value = route.params.address
      }
    })

    watch(selectedAddress, async (addr) => {
      if (isValidAddress(addr)) {
        if (addr !== route.params.address) {
          // push the updated route
          router.push({
            path: '/history',
            params: {
              address: addr
            }
          })
        }
      }
    })

    watch(() => route.params.address, (val) => {
      if (isValidAddress(val)) {
        selectedAddress.value = val
      }
    })

    return {
      selectedAddress,
      isValidAddress,
      bondingEntityUrl
    }
  }
}
</script>
