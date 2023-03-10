<template>
  <div>
    <q-table
      id="reward-data"
      title="Rewards"
      :loading="loading"
      :columns="columns"
      :rows="data"
      :rows-per-page-options="rowsPerPageOptions"
      v-model:pagination="pagination"
      row-key="id"
      @request="onRequest"
    >
      <template v-slot:pagination>
        <q-pagination
          v-model="currentPage"
          :max="maxPages"
          :max-pages="6"
          boundary-numbers
          :text-color="$q.dark.isActive ? 'yellow' : 'primary'"
          :active-color="$q.dark.isActive ? 'yellow' : 'primary'"
          :active-text-color="$q.dark.isActive ? 'black' : 'white'"
        />
      </template>
      <template v-slot:body="props">
        <q-tr>
          <q-td key="blockNumber" :props="props">
            <a :href="tidechainExplorerUrl + props.row.blockNumber" target="_blank" class="external-link">
              {{ props.row.blockNumber }}
            </a>
          </q-td>

          <q-td key="era" :props="props">
            {{ props.row.era }}
          </q-td>

          <q-td key="timestamp" :props="props">
            {{ formatDateTimeInternational(props.row.timestamp) }}
          </q-td>

          <!-- <q-td key="accountId" :props="props" >
            <identicon :address="props.row.accountId" />
            <a :href="bondingEntityUrl + props.row.accountId" target="_blank" class="external-link">
              <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.accountId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
              <span v-else class="q-ml-sm">{{ props.row.accountId }}</span>
            </a>
          </q-td> -->

          <q-td key="amount" :props="props">
            <span>{{ formatToken('TDFY', props.row.amount, 4) }}<q-tooltip>{{ formatToken('TDFY', props.row.amount) + ' TDFY' }}</q-tooltip></span>
          </q-td>

          <q-td key="validatorId" :props="props" >
            <identicon :address="props.row.validatorId" />
            <!-- <a :href="bondingValidatorUrl + props.row.validatorId" target="_blank" class="external-link">
              <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.validatorId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
              <span v-else class="q-ml-sm">{{ props.row.validatorId }}</span>
            </a> -->
            <router-link
              :to="{ name: 'history', params: { address: props.row.validatorId } }"
              class="entity-link"
            >
              <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.validatorId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
              <span v-else class="q-ml-sm">{{ props.row.validatorId }}</span>
            </router-link>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useQuery } from '@urql/vue'
import { extend } from 'quasar'
import { trimHash } from 'src/utils/addresses'
import { useRewardStore } from 'src/stores/reward'
import { formatToken } from 'src/utils/tokens'
import { formatDateTimeInternational } from 'src/utils/time'
import { tidechainExplorerUrl, bondingEntityUrl, bondingValidatorUrl, rowsPerPageOptions } from 'src/utils/constants'
import { matCheckCircle, matCancel } from 'src/utils/icons'

import Identicon from 'src/components/Identicon.vue'

export default {
  name: 'Reward',

  components: {
    Identicon
  },

  props: {
    account: String
  },

  setup (props) {
    const rewardStore = useRewardStore()
    const currentPage = ref(rewardStore.pagination.page)
    const pagination = ref(rewardStore.pagination)
    const selectedAddress = ref(props.account)

    rewardStore.variables.id_eq = selectedAddress.value

    const columns = [
      {
        label: 'Block',
        name: 'blockNumber',
        field: 'blockNumber',
        required: true,
        align: 'left',
        sortable: false
      },
      {
        label: 'Era',
        name: 'era',
        field: 'era',
        required: true,
        align: 'left',
        sortable: false
      },
      {
        label: 'Time',
        name: 'timestamp',
        field: 'timestamp',
        required: true,
        align: 'left',
        sortable: false
      },
      // {
      //   label: 'Account',
      //   name: 'accountId',
      //   field: 'accountId',
      //   required: true,
      //   align: 'left',
      //   sortable: false
      // },
      {
        label: 'Amount',
        name: 'amount',
        field: 'amount',
        required: true,
        align: 'right',
        sortable: false
      },
      {
        label: 'Validator',
        name: 'validatorId',
        field: 'validatorId',
        required: true,
        align: 'left',
        sortable: false
      }
    ]

    function rewardsQuery () {
      const result = useQuery({
        query: `
        query MyQuery($first: Int! = 10, $after: String, $id_eq: String) {
          rewardsConnection(orderBy: blockNumber_DESC, first: $first, after: $after, where: {account: {id_eq: $id_eq}}) {
            totalCount
            edges {
              node {
                amount
                blockNumber
                era
                extrinsicHash
                id
                timestamp
                validatorId
              }
            }
          }
        }
        `,
        variables
      })

      return result
    }

    const variables = computed(() => rewardStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (rewardStore.pagination.rowsPerPage === 0) return 1
      if (rewardStore.pagination.rowsNumber % rewardStore.pagination.rowsPerPage) extra = 1
      return rewardStore.pagination.rowsNumber / rewardStore.pagination.rowsPerPage + extra
    })

    watch(() => props.account, () => {
      selectedAddress.value = props.account
    })

    watch(selectedAddress, () => {
      rewardStore.variables.id_eq = selectedAddress.value
    })

    const result = rewardsQuery()

    watch(result.error, (error) => {
      console.log(error)
    })

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      rewardStore.pagination.rowsNumber = data.rewardsConnection.totalCount
      // console.log(data.rewardsConnection.edges)
      const mapped = data.rewardsConnection.edges.map((d) => {
        return {
          // accountId: d.node.account.id,
          amount: d.node.amount,
          validatorId: d.node.validatorId,
          blockNumber: d.node.blockNumber,
          era: d.node.era,
          // extrinsicHash: d.node.extrinsicHash,
          // proposalHash: d.node.proposalHash,
          timestamp: d.node.timestamp,
          // transactionId: d.node.transactionId,
          id: d.node.id
        }
      })
      rewardStore.data.splice(0, rewardStore.data.length, ...mapped)
      console.log(rewardStore.data)
    })

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = rewardStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = rewardStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      rewardStore.variables.first = first
      rewardStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = rewardStore.pagination = extend(false, rewardStore.pagination, props.pagination)

      setVariables(first, after)
    }

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: rewardStore.data,
      pagination,
      onRequest,
      maxPages,
      currentPage,
      trimHash,
      formatToken,
      formatDateTimeInternational,
      tidechainExplorerUrl,
      rowsPerPageOptions,
      matCheckCircle,
      matCancel,
      bondingEntityUrl,
      bondingValidatorUrl
    }
  }
}
</script>
