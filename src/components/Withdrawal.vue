<template>
  <div>
    <q-table
      id="withdrawal-data"
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
        <Pagination
          v-model="currentPage"
          :max="maxPages"
        />
      </template>
      <template v-slot:body="props">
        <q-tr>
          <q-td key="blockNumber" :props="props">
            <BlockNumber :blockNumber="props.row.blockNumber" />
          </q-td>

          <q-td key="timestamp" :props="props">
            <DateTimeInternational :timestamp="props.row.timestamp" />
          </q-td>

          <q-td key="amount" :props="props">
            <TokenDisplay :symbol="props.row.asset" :amount="props.row.amount" />
          </q-td>

          <q-td key="asset" :props="props">
            {{  props.row.asset }}
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
import { useWithdrawalStore } from 'src/stores/withdrawal'
import { rowsPerPageOptions } from 'src/utils/constants'

import Pagination from 'src/components/Pagination.vue'
import BlockNumber from './BlockNumber.vue'
import DateTimeInternational from './DateTimeInternational.vue'
import TokenDisplay from './TokenDisplay.vue'

export default {
  name: 'Withdrawal',

  components: {
    Pagination,
    BlockNumber,
    DateTimeInternational,
    TokenDisplay
  },

  props: {
    account: {
      type: String,
      default: null
    }
  },

  setup (props) {
    const withdrawalStore = useWithdrawalStore()
    const currentPage = ref(withdrawalStore.pagination.page)
    const pagination = ref(withdrawalStore.pagination)
    const selectedAddress = ref(props.account || null)

    withdrawalStore.variables.id_eq = selectedAddress.value

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
          query MyQuery($first: Int! = 10, $after: String, $id_eq: String) {
            withdrawalsConnection(orderBy: blockNumber_DESC, first: $first, after: $after, where: {account: {id_eq: $id_eq}}) {
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

    const variables = computed(() => withdrawalStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (withdrawalStore.pagination.rowsPerPage === 0) return 1
      if (withdrawalStore.pagination.rowsNumber % withdrawalStore.pagination.rowsPerPage) extra = 1
      return withdrawalStore.pagination.rowsNumber / withdrawalStore.pagination.rowsPerPage + extra
    })

    watch(() => props.account, () => {
      selectedAddress.value = props.account
    })

    watch(selectedAddress, () => {
      withdrawalStore.variables.id_eq = selectedAddress.value
    })

    const result = withdrawalsQuery()

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      withdrawalStore.pagination.rowsNumber = data.withdrawalsConnection.totalCount

      const mapped = data.withdrawalsConnection.edges.map((d) => {
        return {
          // accountId: d.node.account.id,
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
      withdrawalStore.data.splice(0, withdrawalStore.data.length, ...mapped)
    })

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = withdrawalStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = withdrawalStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      withdrawalStore.variables.first = first
      withdrawalStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = withdrawalStore.pagination = extend(false, withdrawalStore.pagination, props.pagination)

      setVariables(first, after)
    }

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: withdrawalStore.data,
      pagination,
      onRequest,
      maxPages,
      currentPage,
      rowsPerPageOptions
    }
  }
}
</script>
