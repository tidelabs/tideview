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
import { useActiveBondStore } from 'src/stores/activeBond'
import { rowsPerPageOptions } from 'src/utils/constants'
import usePagination from 'src/utils/usePagination'

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
    },
    useAccount: {
      type: Boolean
    }
  },

  setup (props) {
    const activeBondStore = useActiveBondStore()
    const selectedAddress = ref(props.account || null)

    // activeBondStore.data.splice(0, activeBondStore.data.length)

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

    const {
      pagination,
      currentPage,
      paginationVariables,
      maxPages,
      onRequest
    } = usePagination({
      account: props.account,
      useAccount: props.useAccount,
      selectedAddress
    })

    const query = computed(() => {
      return `
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
      `
    })

    const variables = computed(() => {
      return paginationVariables.value
    })

    const result = useQuery({
      query,
      variables,
      requestPolicy: 'network-only'
    })

    watch(result.data, (data) => {
      if (!data) {
        activeBondStore.data.splice(0, activeBondStore.data.length)
        return
      }

      // total rows available
      pagination.value.rowsNumber = data.stakersConnection.totalCount

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

    watch(() => props.account, (val) => {
      selectedAddress.value = val
    })

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
