<template>
  <div>
    <q-table
      id="balance-data"
      title="Balances"
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
          <q-td key="asset" :props="props" >
            {{ props.row.asset }}
          </q-td>

          <q-td key="available" :props="props">
            <TokenDisplay :symbol="props.row.asset" :amount="props.row.available" />
          </q-td>

          <q-td key="reserved" :props="props">
            <TokenDisplay :symbol="props.row.asset" :amount="props.row.reserved" />
          </q-td>

          <q-td key="total" :props="props">
            <TokenDisplay :symbol="props.row.asset" :amount="props.row.total" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useQuery } from '@urql/vue'
import { useBalanceStore } from 'src/stores/balance'
import { useFilterStore } from 'src/stores/filter'
import { rowsPerPageOptions } from 'src/utils/constants'
import usePagination from 'src/utils/usePagination'
import useVariables from 'src/utils/useVariables'

import Pagination from 'src/components/Pagination.vue'
import TokenDisplay from './TokenDisplay.vue'

export default {
  name: 'Balance',

  components: {
    Pagination,
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
    const filterStore = useFilterStore()
    const balanceStore = useBalanceStore()
    const selectedAddress = ref(props.account || null)

    // balanceStore.data.splice(0, balanceStore.data.length)

    const columns = [
      {
        label: 'Asset',
        name: 'asset',
        field: 'asset',
        required: true,
        align: 'left',
        sortable: false
      },
      {
        label: 'Available',
        name: 'available',
        field: 'available',
        required: true,
        align: 'right',
        sortable: false
      },
      {
        label: 'Reserved',
        name: 'reserved',
        field: 'reserved',
        required: true,
        align: 'right',
        sortable: false
      },
      {
        label: 'Total',
        name: 'total',
        field: 'total',
        required: true,
        align: 'right',
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
        query MyQuery($id_eq: String, $first: Int = 10, $after: String) {
          accountsConnection(where: {id_eq: $id_eq}, orderBy: id_ASC, first: $first, after: $after) {
            totalCount
            edges {
              node {
                id
                balances(orderBy: asset_ASC) {
                  asset
                  free
                  reserved
                  total
                  updatedAt
                }
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
      // console.log(result.data)
      if (!data) {
        balanceStore.data.splice(0, balanceStore.data.length)
        return
      }

      // total rows available
      pagination.value.rowsNumber = data.accountsConnection.totalCount

      const mapped = []
      data.accountsConnection.edges.forEach((d) => {
        d.node.balances.forEach((bal) => {
          if (filterStore.useFilter) {
            if (filterStore.token && filterStore.token === bal.asset) {
              mapped.push({
                asset: bal.asset,
                available: bal.free,
                reserved: bal.reserved,
                total: bal.total
              })
            }
          }
          else {
            mapped.push({
              asset: bal.asset,
              available: bal.free,
              reserved: bal.reserved,
              total: bal.total
            })
          }
        })
      })
      balanceStore.data.splice(0, balanceStore.data.length, ...mapped)
    })

    watch(() => props.account, (val) => {
      selectedAddress.value = val
    })

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: balanceStore.data,
      pagination,
      onRequest,
      maxPages,
      currentPage,
      rowsPerPageOptions
    }
  }
}
</script>
