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
            <AccountId :accountId="props.row.accountId" :selectedAccount="account" />
          </q-td>

          <q-td key="slippage" :props="props" >
            <Slippage :amount="props.row.slippage" />
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
import { useSwapStore } from 'src/stores/swap'
import { rowsPerPageOptions } from 'src/utils/constants'
import { matCheckCircle, matCancel } from 'src/utils/icons'
import usePagination from 'src/utils/usePagination'
import useVariables from 'src/utils/useVariables'

import Pagination from 'src/components/Pagination.vue'
import BlockNumber from './BlockNumber.vue'
import DateTimeInternational from './DateTimeInternational.vue'
import AccountId from './AccountId.vue'
import TokenDisplay from './TokenDisplay.vue'
import Slippage from './Slippage.vue'

export default {
  name: 'Swaps',

  components: {
    Pagination,
    BlockNumber,
    DateTimeInternational,
    AccountId,
    TokenDisplay,
    Slippage
  },

  props: {
    account: {
      type: String,
      default: null
    },
    useAccount: {
      type: Boolean
    }
  },

  setup (props) {
    const swapStore = useSwapStore()
    const selectedAddress = ref(props.account || null)

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
        label: 'Slippage',
        name: 'slippage',
        field: 'slippage',
        required: true,
        align: 'right',
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

    const {
      pagination,
      currentPage,
      paginationVariables,
      maxPages,
      onRequest
    } = usePagination({
      useAccount: props.useAccount,
      selectedAddress
    })

    const {
      variables
    } = useVariables({
      paginationVariables,
      useAccount: props.useAccount,
      selectedAddress
    })

    const query = computed(() => {
      return `
        query MyQuery($first: Int! = 10, $after: String, $id_eq: String, $assetTo_eq: String, $assetFrom_eq: String, $timestamp_gte: DateTime, $timestamp_lte: DateTime) {
          swapsConnection(orderBy: blockNumber_DESC, first: $first, after: $after, where: {isMarketMaker_not_eq: true, type_not_eq: "Limit", account: {id_eq: $id_eq}, timestamp_gte: $timestamp_gte, timestamp_lte: $timestamp_lte, AND: {assetFrom_eq: $assetFrom_eq, OR: {assetTo_eq: $assetTo_eq}}}) {
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
      `
    })

    const result = useQuery({
      query,
      variables,
      requestPolicy: 'network-only'
    })

    watch(result.data, (data) => {
      if (!data) {
        swapStore.data.splice(0, swapStore.data.length)
        return
      }

      // total rows available
      pagination.value.rowsNumber = data.swapsConnection.totalCount

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
          // isMarketMaker: d.node.isMarketMaker,
          // extrinsicHash: d.node.extrinsicHash,
          // proposalHash: d.node.proposalHash,
          timestamp: d.node.timestamp,
          // transactionId: d.node.transactionId,
          success: d.node.success,
          id: d.node.id
        }
      })
      swapStore.data.splice(0, swapStore.data.length, ...mapped)
    })

    watch(() => props.account, (val) => {
      selectedAddress.value = val
    })

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
