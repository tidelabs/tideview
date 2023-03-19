<template>
  <div v-if="accountId">
    <div v-if="accountId === 'fhFNDGKtRFfPJZbJZMNLRNwTC6rDJJt3RofUrz7vhMqbrDcBf'"><q-badge color="green-8" text-color="white">Market Maker</q-badge></div>
    <!-- <div v-else-if="accountId === 'fhCBCt9jfV4TJ2c4P8fymVHgTE7oXtQhNHcg5AShpF4x1S4Gr'"><q-badge color="blue-8" text-color="white">All Time High</q-badge></div> -->
    <div v-else-if="accountId === 'fhCMUeg6DisVdRfbK29U1TFpSiWJHceZsPGwpQzGoyy1tJ1Q8'"><q-badge color="blue-8" text-color="white">All Time High</q-badge></div>
    <div v-else-if="accountId === 'fhCBCt9jfV4TJ2dvdhAkca1FQqxbEjyyXe7SczZ9V8TLuK7pb'"><q-badge color="orange-8" text-color="white">Sunrise Rewards</q-badge></div>
    <div v-else-if="selectedAccount && accountId === selectedAccount"><q-badge>This Account<q-tooltip>{{ accountId }}</q-tooltip></q-badge></div>
    <div v-else>
      <Identicon :address="accountId" />
      <router-link
        :to="{ name: 'history', params: { address: accountId } }"
        class="entity-link"
      >
        <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ getAccountAlias(accountId) }}<q-tooltip>{{ accountId }}</q-tooltip></span>
        <span v-else class="q-ml-sm">{{ getAccountAlias(accountId, false) }}</span>
      </router-link>
    </div>

  </div>
</template>

<script>
import { getAccountAlias } from 'src/utils/addresses'

import Identicon from 'src/components/Identicon.vue'

export default {
  name: 'Account',

  components: {
    Identicon
  },

  props: {
    accountId: {
      type: String
    },
    selectedAccount: {
      type: String
    }
  },

  setup () {
    return {
      getAccountAlias
    }
  }
}
</script>
