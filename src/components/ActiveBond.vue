<template>
  <div>
    <q-table
      id="active-bond-data"
      title="Active Bonds"
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
          <q-td key="accountId" :props="props" >
            <Account :accountId="props.row.accountId" :selectedAccount="account" />
          </q-td>

          <q-td key="role" :props="props">
            <span>{{ props.row.role }}</span>
          </q-td>

          <q-td key="payeeType" :props="props">
            <span>{{ props.row.payeeType }}</span>
          </q-td>

          <q-td key="activeBond" :props="props">
            <TokenDisplay symbol="TDFY" :amount="props.row.activeBond" />
          </q-td>

          <q-td key="totalReward" :props="props">
            <TokenDisplay symbol="TDFY" :amount="props.row.totalReward" />
          </q-td>

          <q-td key="totalSlash" :props="props">
            <TokenDisplay symbol="TDFY" :amount="props.row.totalSlash" />
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
import { useActiveBondStore } from 'src/stores/activeBond'
import { rowsPerPageOptions } from 'src/utils/constants'

import Pagination from 'src/components/Pagination.vue'
import Account from './Account.vue'
import TokenDisplay from './TokenDisplay.vue'

export default {
  name: 'Deposits',

  components: {
    Pagination,
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
    const activeBondStore = useActiveBondStore()
    const currentPage = ref(activeBondStore.pagination.page)
    const pagination = ref(activeBondStore.pagination)
    const selectedAddress = ref(props.account || null)

    activeBondStore.variables.id_eq = selectedAddress.value

    const columns = [
      {
        label: 'Account',
        name: 'accountId',
        field: 'accountId',
        required: true,
        align: 'left',
        sortable: false
      },
      {
        label: 'Role',
        name: 'role',
        field: 'role',
        required: true,
        align: 'left',
        sortable: false
      },
      {
        label: 'Payee Type',
        name: 'payeeType',
        field: 'payeeType',
        required: true,
        align: 'left',
        sortable: false
      },
      {
        label: 'Active Bond',
        name: 'activeBond',
        field: 'activeBond',
        required: true,
        align: 'right',
        sortable: false
      },
      {
        label: 'Total Reward',
        name: 'totalReward',
        field: 'totalReward',
        required: true,
        align: 'right',
        sortable: false
      },
      {
        label: 'Total Slash',
        name: 'totalSlash',
        field: 'totalSlash',
        required: true,
        align: 'right',
        sortable: false
      }
    ]

    function activeBondsQuery () {
      const result = useQuery({
        query: `
          query MyQuery($first: Int! = 10, $after: String, $id_eq: String) {
            stakersConnection(orderBy: id_ASC, first: $first, after: $after, where: {id_eq: $id_eq}) {
              totalCount
              edges {
                node {
                  activeBond
                  id
                  payeeType
                  role
                  totalReward
                  totalSlash
                }
              }
            }
          }
        `,
        variables
      })

      return result
    }

    const variables = computed(() => activeBondStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (activeBondStore.pagination.rowsPerPage === 0) return 1
      if (activeBondStore.pagination.rowsNumber % activeBondStore.pagination.rowsPerPage) extra = 1
      return activeBondStore.pagination.rowsNumber / activeBondStore.pagination.rowsPerPage + extra
    })

    watch(() => props.account, () => {
      selectedAddress.value = props.account
    })

    watch(selectedAddress, () => {
      activeBondStore.variables.id_eq = selectedAddress.value
    })

    const result = activeBondsQuery()

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      activeBondStore.pagination.rowsNumber = data.stakersConnection.totalCount

      const mapped = data.stakersConnection.edges.map((d) => {
        return {
          accountId: d.node.id,
          role: d.node.role,
          payeeType: d.node.payeeType,
          activeBond: d.node.activeBond,
          totalReward: d.node.totalReward,
          totalSlash: d.node.totalSlash
        }
      })
      activeBondStore.data.splice(0, activeBondStore.data.length, ...mapped)
    })

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = activeBondStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = activeBondStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      activeBondStore.variables.first = first
      activeBondStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = activeBondStore.pagination = extend(false, activeBondStore.pagination, props.pagination)

      setVariables(first, after)
    }

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: activeBondStore.data,
      pagination,
      onRequest,
      maxPages,
      currentPage,
      rowsPerPageOptions
    }
  }
}
</script>
