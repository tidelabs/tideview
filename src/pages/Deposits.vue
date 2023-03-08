<template>
  <q-page padding>
    <q-table
      id="deposits-data"
      title="Deposits"
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
import { useDepositsStore } from 'src/stores/deposits'
import { useAssetsStore } from 'src/stores/assets'
import { toBaseToken } from 'src/utils/tokens'
import { formatDateTimeInternational } from 'src/utils/time'
import { tidechainExplorerUrl, bondingEntityUrl, rowsPerPageOptions } from 'src/utils/constants'

import Identicon from 'src/components/Identicon.vue'

export default {
  name: 'Deposits',

  components: {
    Identicon
  },

  setup () {
    const depositsStore = useDepositsStore()
    const assetsStore = useAssetsStore()
    const currentPage = ref(depositsStore.pagination.page)
    const pagination = ref(depositsStore.pagination)
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

    function depositsQuery () {
      const result = useQuery({
        query: `
          query MyQuery($first: Int! = 10, $after: String) {
            depositsConnection(orderBy: blockNumber_DESC, first: $first, after: $after) {
              totalCount
              edges {
                node {
                  account {
                    id
                  }
                  amount
                  asset
                  blockNumber
                  complianceLevel
                  extrinsicHash
                  id
                  proposalHash
                  timestamp
                  transactionId
                }
              }
            }
          }
        `,
        variables
      })

      return result
    }

    const variables = computed(() => depositsStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (depositsStore.pagination.rowsPerPage === 0) return 1
      if (depositsStore.pagination.rowsNumber % depositsStore.pagination.rowsPerPage) extra = 1
      return depositsStore.pagination.rowsNumber / depositsStore.pagination.rowsPerPage + extra
    })

    const result = depositsQuery()

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      depositsStore.pagination.rowsNumber = data.depositsConnection.totalCount

      const mapped = data.depositsConnection.edges.map((d) => {
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
      depositsStore.data.splice(0, depositsStore.data.length, ...mapped)
    })

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = depositsStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = depositsStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      depositsStore.variables.first = first
      depositsStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = depositsStore.pagination = extend(false, depositsStore.pagination, props.pagination)

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
      data: depositsStore.data,
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
