<template>
  <q-page padding>
    <q-table
      id="withdrawals-data"
      title="Withdrawals"
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
          <q-td key="timestamp" :props="props">
            {{  formatDateTimeInternational(props.row.timestamp) }}
          </q-td>
          <q-td key="accountId" :props="props" >
            <identicon :address="props.row.accountId" />
            <a :href="bondingEntityUrl + props.row.accountId" target="_blank" class="external-link">
              <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.accountId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
              <span v-else class="q-ml-sm">{{ props.row.accountId }}</span>
            </a>
            <!-- <router-link
              :to="{ name: 'account', params: { address: props.row.accountId } }"
              class="entity-link"
            >
              <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.accountId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
              <span v-else class="q-ml-sm">{{ props.row.accountId }}</span>
            </router-link> -->
          </q-td>
          <q-td key="amount" :props="props">
            <span>{{ formatToken(props.row.asset, props.row.amount, 4) }}<q-tooltip>{{ formatToken(props.row.asset, props.row.amount) + ' ' + props.row.asset }}</q-tooltip></span>
          </q-td>
          <q-td key="asset" :props="props">
            {{  props.row.asset }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useQuery } from '@urql/vue'
import { extend } from 'quasar'
import { trimHash } from 'src/utils/addresses'
import { useWithdrawalsStore } from 'src/stores/withdrawals'
import { useAssetsStore } from 'src/stores/assets'
import { toBaseToken } from 'src/utils/tokens'
import { formatDateTimeInternational } from 'src/utils/time'
import { tidechainExplorerUrl, bondingEntityUrl, rowsPerPageOptions } from 'src/utils/constants'

import Identicon from 'src/components/Identicon.vue'

export default {
  name: 'Withdrawals',

  components: {
    Identicon
  },

  setup () {
    const withdrawalsStore = useWithdrawalsStore()
    const assetsStore = useAssetsStore()
    const currentPage = ref(withdrawalsStore.pagination.page)
    const pagination = ref(withdrawalsStore.pagination)

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
        label: 'Time',
        name: 'timestamp',
        field: 'timestamp',
        required: true,
        align: 'left',
        sortable: false
      },
      {
        label: 'Account',
        name: 'accountId',
        field: 'accountId',
        required: true,
        align: 'left',
        sortable: false
      },
      {
        label: 'Amount',
        name: 'amount',
        field: 'amount',
        required: true,
        align: 'right',
        sortable: false
      },
      {
        label: 'Asset',
        name: 'asset',
        field: 'asset',
        required: true,
        align: 'left',
        sortable: false
      }
    ]

    function withdrawalsQuery () {
      const result = useQuery({
        query: `
          query MyQuery($first: Int! = 10, $after: String) {
            withdrawalsConnection(orderBy: blockNumber_DESC, first: $first, after: $after) {
              totalCount
              edges {
                node {
                  account {
                    id
                  }
                  amount
                  asset
                  blockNumber
                  extrinsicHash
                  id
                  proposalHash
                  status
                  timestamp
                }
              }
            }
          }
        `,
        variables
      })

      return result
    }

    const variables = computed(() => withdrawalsStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (withdrawalsStore.pagination.rowsPerPage === 0) return 1
      if (withdrawalsStore.pagination.rowsNumber % withdrawalsStore.pagination.rowsPerPage) extra = 1
      return withdrawalsStore.pagination.rowsNumber / withdrawalsStore.pagination.rowsPerPage + extra
    })

    const result = withdrawalsQuery()

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      withdrawalsStore.pagination.rowsNumber = data.withdrawalsConnection.totalCount

      const mapped = data.withdrawalsConnection.edges.map((d) => {
        return {
          accountId: d.node.account.id,
          amount: d.node.amount,
          asset: d.node.asset,
          blockNumber: d.node.blockNumber,
          // extrinsicHash: d.node.extrinsicHash,
          // proposalHash: d.node.proposalHash,
          timestamp: d.node.timestamp,
          // transactionId: d.node.transactionId,
          id: d.node.id
        }
      })
      withdrawalsStore.data.splice(0, withdrawalsStore.data.length, ...mapped)
    })

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = withdrawalsStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = withdrawalsStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      withdrawalsStore.variables.first = first
      withdrawalsStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = withdrawalsStore.pagination = extend(false, withdrawalsStore.pagination, props.pagination)

      setVariables(first, after)
    }

    function formatToken (symbol, amount, precision) {
      const token = assetsStore.assets.find((token) => token.symbol === symbol)
      if (token) {
        return toBaseToken(amount, token.decimal, precision || token.decimal)
      }
      return ''
    }

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: withdrawalsStore.data,
      pagination,
      onRequest,
      maxPages,
      currentPage,
      trimHash,
      formatToken,
      formatDateTimeInternational,
      tidechainExplorerUrl,
      rowsPerPageOptions,
      bondingEntityUrl
    }
  }
}
</script>
