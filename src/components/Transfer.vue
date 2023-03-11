<template>
  <div>
    <q-table
      id="transfer-data"
      title="Transfers"
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

          <q-td key="fromId" :props="props" >
            <Account :accountId="props.row.fromId" :selectedAccount="account" />
          </q-td>

          <q-td key="toId" :props="props" >
            <Account :accountId="props.row.toId" :selectedAccount="account" />
          </q-td>

          <q-td key="amount" :props="props">
            <TokenDisplay :symbol="props.row.asset" :amount="props.row.amount" />
          </q-td>

          <q-td key="asset" :props="props">
            {{  props.row.asset }}
          </q-td>

          <q-td key="status" :props="props">
            <q-icon v-if="props.row.success" :name="matCheckCircle" size="20px" :color="$q.dark.isActive ? 'lime-13' : 'green-12'" />
            <q-icon v-else :name="matCancel" size="20px" color="red-13" />
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
import { useTransferStore } from 'src/stores/transfer'
import { rowsPerPageOptions } from 'src/utils/constants'
import { matCheckCircle, matCancel } from 'src/utils/icons'

import Pagination from 'src/components/Pagination.vue'
import BlockNumber from './BlockNumber.vue'
import DateTimeInternational from './DateTimeInternational.vue'
import Account from './Account.vue'
import TokenDisplay from './TokenDisplay.vue'

export default {
  name: 'Transfer',

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
    const transferStore = useTransferStore()
    const currentPage = ref(transferStore.pagination.page)
    const pagination = ref(transferStore.pagination)
    const selectedAddress = ref(props.account || null)

    transferStore.variables.id_eq = selectedAddress.value

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
        label: 'From Account',
        name: 'fromId',
        field: 'fromId',
        required: true,
        align: 'left',
        sortable: false
      },
      {
        label: 'To Account',
        name: 'toId',
        field: 'toId',
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
      },
      {
        label: 'Status',
        name: 'status',
        field: 'success',
        required: true,
        align: 'center',
        sortable: false
      }
    ]

    function transfersQuery () {
      const result = useQuery({
        query: `
          query MyQuery($first: Int! = 10, $after: String, $id_eq: String) {
            transfersConnection(orderBy: blockNumber_DESC, first: $first, after: $after, where: {from: {id_eq: $id_eq}, OR: {to: {id_eq: $id_eq}}}) {
              edges {
                node {
                  from {
                    id
                  }
                  to {
                    id
                  }
                  amount
                  asset
                  blockNumber
                  extrinsicHash
                  id
                  success
                  timestamp
                  type
                }
              }
            }
          }
        `,
        variables
      })

      return result
    }

    const variables = computed(() => transferStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (transferStore.pagination.rowsPerPage === 0) return 1
      if (transferStore.pagination.rowsNumber % transferStore.pagination.rowsPerPage) extra = 1
      return transferStore.pagination.rowsNumber / transferStore.pagination.rowsPerPage + extra
    })

    watch(() => props.account, () => {
      selectedAddress.value = props.account
    })

    watch(selectedAddress, () => {
      transferStore.variables.id_eq = selectedAddress.value
    })

    const result = transfersQuery()

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      transferStore.pagination.rowsNumber = data.transfersConnection.totalCount

      const mapped = data.transfersConnection.edges.map((d) => {
        return {
          fromId: d.node.from.id,
          toId: d.node.to.id,
          amount: d.node.amount,
          asset: d.node.asset,
          blockNumber: d.node.blockNumber,
          // extrinsicHash: d.node.extrinsicHash,
          // proposalHash: d.node.proposalHash,
          timestamp: d.node.timestamp,
          // transactionId: d.node.transactionId,
          success: d.node.success,
          id: d.node.id
        }
      })
      transferStore.data.splice(0, transferStore.data.length, ...mapped)
    })

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = transferStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = transferStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      transferStore.variables.first = first
      transferStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = transferStore.pagination = extend(false, transferStore.pagination, props.pagination)

      setVariables(first, after)
    }

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: transferStore.data,
      pagination,
      onRequest,
      maxPages,
      currentPage,
      rowsPerPageOptions,
      matCheckCircle,
      matCancel,
      selectedAddress
    }
  }
}
</script>
