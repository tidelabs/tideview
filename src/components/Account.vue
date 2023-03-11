<template>
  <div v-if="accountId">
    <div v-if="selectedAccount && accountId === selectedAccount"><q-badge>This Account</q-badge><q-tooltip>{{ accountId }}</q-tooltip></div>
    <div v-else>
      <Identicon :address="accountId" />
      <router-link
        :to="{ name: 'history', params: { address: accountId } }"
        class="entity-link"
      >
        <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(accountId, 16) }}<q-tooltip>{{ accountId }}</q-tooltip></span>
        <span v-else class="q-ml-sm">{{ accountId }}</span>
      </router-link>
    </div>

  </div>
</template>

<script>
import { trimHash } from 'src/utils/addresses'

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
      trimHash
    }
  }
}
</script>
