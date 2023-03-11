<template>
  <div>
    <q-table
      id="deposit-data"
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

          <q-td key="accountId" :props="props" >
            <Account :accountId="props.row.accountId" :selectedAccount="account" />
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
import { useDepositStore } from 'src/stores/deposit'
import { rowsPerPageOptions } from 'src/utils/constants'

import Pagination from 'src/components/Pagination.vue'
import BlockNumber from './BlockNumber.vue'
import DateTimeInternational from './DateTimeInternational.vue'
import Account from './Account.vue'
import TokenDisplay from './TokenDisplay.vue'

export default {
  name: 'Deposits',

  components: {
    Pagination,
    BlockNumber,
    DateTimeInternational,
    Account,
    TokenDisplay
  },

  props: {
    account: {
      type: String,
      default: null
    }
  },

  setup (props) {
    const depositStore = useDepositStore()
    const currentPage = ref(depositStore.pagination.page)
    const pagination = ref(depositStore.pagination)
    const selectedAddress = ref(props.account || null)

    depositStore.variables.id_eq = selectedAddress.value

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
          query MyQuery($first: Int! = 10, $after: String, $id_eq: String) {
            depositsConnection(orderBy: blockNumber_DESC, first: $first, after: $after, where: {account: {id_eq: $id_eq}}) {
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

    const variables = computed(() => depositStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (depositStore.pagination.rowsPerPage === 0) return 1
      if (depositStore.pagination.rowsNumber % depositStore.pagination.rowsPerPage) extra = 1
      return depositStore.pagination.rowsNumber / depositStore.pagination.rowsPerPage + extra
    })

    watch(() => props.account, () => {
      selectedAddress.value = props.account
    })

    watch(selectedAddress, () => {
      depositStore.variables.id_eq = selectedAddress.value
    })

    const result = depositsQuery()

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      depositStore.pagination.rowsNumber = data.depositsConnection.totalCount

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
      depositStore.data.splice(0, depositStore.data.length, ...mapped)
    })

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = depositStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = depositStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      depositStore.variables.first = first
      depositStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = depositStore.pagination = extend(false, depositStore.pagination, props.pagination)

      setVariables(first, after)
    }

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: depositStore.data,
      pagination,
      onRequest,
      maxPages,
      currentPage,
      rowsPerPageOptions
    }
  }
}
</script>
