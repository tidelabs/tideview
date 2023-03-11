<template>
  <div>
    <q-table
      id="swap-data"
      title="Swaps"
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

          <q-td key="amountFrom" :props="props">
            <TokenDisplay :symbol="props.row.assetFrom" :amount="props.row.amountFrom" />
          </q-td>

          <q-td key="assetFrom" :props="props">
            {{  props.row.assetFrom }}
          </q-td>

          <q-td key="amountTo" :props="props">
            <TokenDisplay :symbol="props.row.assetTo" :amount="props.row.amountTo" />
          </q-td>

          <q-td key="assetTo" :props="props">
            {{  props.row.assetTo }}
          </q-td>

          <q-td key="status" :props="props">
            {{  props.row.status }}
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
import { useSwapStore } from 'src/stores/swap'
import { rowsPerPageOptions } from 'src/utils/constants'
import { matCheckCircle, matCancel } from 'src/utils/icons'

import Pagination from 'src/components/Pagination.vue'
import BlockNumber from './BlockNumber.vue'
import DateTimeInternational from './DateTimeInternational.vue'
import Account from './Account.vue'
import TokenDisplay from './TokenDisplay.vue'

export default {
  name: 'Swaps',

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
    const swapStore = useSwapStore()
    const currentPage = ref(swapStore.pagination.page)
    const pagination = ref(swapStore.pagination)
    const selectedAddress = ref(props.account)

    swapStore.variables.id_eq = selectedAddress.value

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
        label: 'Amount From',
        name: 'amountFrom',
        field: 'amountFrom',
        required: true,
        align: 'right',
        sortable: false
      },
      {
        label: 'Asset From',
        name: 'assetFrom',
        field: 'assetFrom',
        required: true,
        align: 'right',
        sortable: false
      },
      {
        label: 'Amount To',
        name: 'amountTo',
        field: 'amountTo',
        required: true,
        align: 'right',
        sortable: false
      },
      {
        label: 'Asset To',
        name: 'assetTo',
        field: 'assetTo',
        required: true,
        align: 'right',
        sortable: false
      },
      {
        label: 'Status',
        name: 'status',
        field: 'status',
        required: true,
        align: 'left',
        sortable: false
      }
    ]

    function swapsQuery () {
      const result = useQuery({
        query: `
          query MyQuery($first: Int! = 10, $after: String, $id_eq: String) {
            swapsConnection(orderBy: blockNumber_DESC, first: $first, after: $after, where: {type_not_eq: "Limit", isMarketMaker_not_eq: true, account: {id_eq: $id_eq}}) {
              totalCount
              edges {
                node {
                  account {
                    id
                  }
                  amountFrom
                  amountFromFilled
                  assetFrom
                  amountTo
                  amountToFilled
                  assetTo
                  blockNumber
                  extrinsicHash
                  id
                  isMarketMaker
                  slippage
                  status
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

    const variables = computed(() => swapStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (swapStore.pagination.rowsPerPage === 0) return 1
      if (swapStore.pagination.rowsNumber % swapStore.pagination.rowsPerPage) extra = 1
      return swapStore.pagination.rowsNumber / swapStore.pagination.rowsPerPage + extra
    })

    watch(() => props.account, () => {
      selectedAddress.value = props.account
    })

    watch(selectedAddress, () => {
      swapStore.variables.id_eq = selectedAddress.value
    })

    const result = swapsQuery()

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      swapStore.pagination.rowsNumber = data.swapsConnection.totalCount

      const mapped = data.swapsConnection.edges.map((d) => {
        return {
          accountId: d.node.account.id,
          amountFrom: d.node.amountFromFilled || d.node.amountFrom,
          assetFrom: d.node.assetFrom,
          // fix for bug in subsquid
          amountTo: d.node.amountToFilled !== d.node.amountFromFilled ? d.node.amountToFilled || d.node.amountTo : d.node.amountTo,
          assetTo: d.node.assetTo,
          slippage: d.node.slippage,
          status: d.node.status,
          type: d.node.type,
          blockNumber: d.node.blockNumber,
          // extrinsicHash: d.node.extrinsicHash,
          // proposalHash: d.node.proposalHash,
          timestamp: d.node.timestamp,
          // transactionId: d.node.transactionId,
          // success: d.node.success,
          id: d.node.id
        }
      })
      swapStore.data.splice(0, swapStore.data.length, ...mapped)
    })

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = swapStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = swapStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      swapStore.variables.first = first
      swapStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = swapStore.pagination = extend(false, swapStore.pagination, props.pagination)

      setVariables(first, after)
    }

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: swapStore.data,
      pagination,
      onRequest,
      maxPages,
      currentPage,
      rowsPerPageOptions,
      matCheckCircle,
      matCancel
    }
  }
}
</script>
