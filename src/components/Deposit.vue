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
            <AccountId :accountId="props.row.accountId" :selectedAccount="account" />
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
import { useDepositStore } from 'src/stores/deposit'
import { rowsPerPageOptions } from 'src/utils/constants'
import usePagination from 'src/utils/usePagination'
import useVariables from 'src/utils/useVariables'

import Pagination from 'src/components/Pagination.vue'
import BlockNumber from './BlockNumber.vue'
import DateTimeInternational from './DateTimeInternational.vue'
import AccountId from './AccountId.vue'
import TokenDisplay from './TokenDisplay.vue'

export default {
  name: 'Deposits',

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
    const depositStore = useDepositStore()
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
        query MyQuery($first: Int! = 10, $after: String, $id_eq: String, $asset_eq: String, $timestamp_gte: DateTime, $timestamp_lte: DateTime) {
          depositsConnection(orderBy: blockNumber_DESC, first: $first, after: $after, where: {account: {id_eq: $id_eq}, asset_eq: $asset_eq, timestamp_gte: $timestamp_gte, timestamp_lte: $timestamp_lte}) {
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
      `
    })

    const result = useQuery({
      query,
      variables,
      requestPolicy: 'network-only'
    })

    watch(result.data, (data) => {
      if (!data) {
        depositStore.data.splice(0, depositStore.data.length)
        return
      }

      // total rows available
      pagination.value.rowsNumber = data.depositsConnection.totalCount

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

    watch(() => props.account, (val) => {
      selectedAddress.value = val
    })

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
