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
            <AccountId :accountId="props.row.fromId" :selectedAccount="account" />
          </q-td>

          <q-td key="toId" :props="props" >
            <AccountId :accountId="props.row.toId" :selectedAccount="account" />
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
import { useTransferStore } from 'src/stores/transfer'
import { rowsPerPageOptions } from 'src/utils/constants'
import { matCheckCircle, matCancel } from 'src/utils/icons'
import usePagination from 'src/utils/usePagination'
import useVariables from 'src/utils/useVariables'

import Pagination from 'src/components/Pagination.vue'
import BlockNumber from './BlockNumber.vue'
import DateTimeInternational from './DateTimeInternational.vue'
import AccountId from './AccountId.vue'
import TokenDisplay from './TokenDisplay.vue'

export default {
  name: 'Transfer',

  components: {
    Pagination,
    BlockNumber,
    DateTimeInternational,
    AccountId,
    TokenDisplay
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
    const transferStore = useTransferStore()
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

    watch(variables, (val) => {
      console.log('variables (Transfers):', JSON.stringify(val, null, 2))
    })

    const query = computed(() => {
      return `
          query MyQuery($first: Int! = 10, $after: String, $id_eq: String, $asset_eq: String, $timestamp_gte: DateTime, $timestamp_lte: DateTime) {
            transfersConnection(orderBy: blockNumber_DESC, first: $first, after: $after, where: {asset_eq: $asset_eq, timestamp_gte: $timestamp_gte, timestamp_lte: $timestamp_lte, AND: { from: {id_eq: $id_eq}, OR: {to: {id_eq: $id_eq}}}}) {
              totalCount
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
      `
    })

    const result = useQuery({
      query,
      variables,
      requestPolicy: 'network-only'
    })

    watch(result.data, (data) => {
      if (!data) {
        transferStore.data.splice(0, transferStore.data.length)
        return
      }

      // total rows available
      pagination.value.rowsNumber = data.transfersConnection.totalCount

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

    watch(() => props.account, (val) => {
      selectedAddress.value = val
    })

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
      matCancel
    }
  }
}
</script>
