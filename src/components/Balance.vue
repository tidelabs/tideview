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
import { extend } from 'quasar'
import { useBalanceStore } from 'src/stores/balance'
import { rowsPerPageOptions } from 'src/utils/constants'

import Pagination from 'src/components/Pagination.vue'
import TokenDisplay from './TokenDisplay.vue'

export default {
  name: 'Deposits',

  components: {
    Pagination,
    TokenDisplay
  },

  props: {
    account: {
      type: String,
      default: null
    }
  },

  setup (props) {
    const balanceStore = useBalanceStore()
    const currentPage = ref(balanceStore.pagination.page)
    const pagination = ref(balanceStore.pagination)
    const selectedAddress = ref(props.account || null)

    balanceStore.variables.id_eq = selectedAddress.value

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

    function activeBalanceQuery () {
      const result = useQuery({
        query: `
          query MyQuery($id_eq: String, $first: Int = 10, $after: String = "") {
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
        `,
        variables
      })

      return result
    }

    const variables = computed(() => balanceStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (balanceStore.pagination.rowsPerPage === 0) return 1
      if (balanceStore.pagination.rowsNumber % balanceStore.pagination.rowsPerPage) extra = 1
      return balanceStore.pagination.rowsNumber / balanceStore.pagination.rowsPerPage + extra
    })

    watch(() => props.account, () => {
      selectedAddress.value = props.account
    })

    watch(selectedAddress, () => {
      balanceStore.variables.id_eq = selectedAddress.value
    })

    const result = activeBalanceQuery()

    watch(result.data, (data) => {
      console.log(result.data)
      if (!data) return

      // total rows available
      balanceStore.pagination.rowsNumber = data.accountsConnection.totalCount

      const mapped = []
      data.accountsConnection.edges.forEach((d) => {
        d.node.balances.forEach((bal) => {
          mapped.push({
            asset: bal.asset,
            available: bal.free,
            reserved: bal.reserved,
            total: bal.total
          })
        })
      })
      balanceStore.data.splice(0, balanceStore.data.length, ...mapped)
    })

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = balanceStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = balanceStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      balanceStore.variables.first = first
      balanceStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = balanceStore.pagination = extend(false, balanceStore.pagination, props.pagination)

      setVariables(first, after)
    }

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
