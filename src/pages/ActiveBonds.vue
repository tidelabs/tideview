<template>
  <q-page padding>
    <q-table
      id="active-bonds-data"
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
        <q-pagination
          v-model="currentPage"
          :max="maxPages"
          :max-pages="6"
          boundary-numbers
          :text-color="$q.dark.isActive ? 'yellow' : 'primary'"
          :active-color="$q.dark.isActive ? 'yellow' : 'primary'"
          :active-text-color="$q.dark.isActive ? 'black' : 'white'"
        />
      </template>
      <template v-slot:body="props">
        <q-tr>
          <q-td key="accountId" :props="props" >
            <identicon :address="props.row.accountId" />
            <!-- <a :href="bondingEntityUrl + props.row.accountId" target="_blank" class="external-link">
              <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.accountId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
              <span v-else class="q-ml-sm">{{ props.row.accountId }}</span>
            </a> -->
            <router-link
              :to="{ name: 'history', params: { address: props.row.accountId } }"
              class="entity-link"
            >
              <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.accountId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
              <span v-else class="q-ml-sm">{{ props.row.accountId }}</span>
            </router-link>
          </q-td>
          <q-td key="role" :props="props">
            <span>{{ props.row.role }}</span>
          </q-td>
          <q-td key="payeeType" :props="props">
            <span>{{ props.row.payeeType }}</span>
          </q-td>
          <q-td key="activeBond" :props="props">
            <span>{{ formatToken('TDFY', props.row.activeBond, 4) }}<q-tooltip>{{ formatToken('TDFY', props.row.activeBond) + ' TDFY' }}</q-tooltip></span>
          </q-td>
          <q-td key="totalReward" :props="props">
            <span>{{ formatToken('TDFY', props.row.totalReward, 4) }}<q-tooltip>{{ formatToken('TDFY', props.row.totalReward) + ' TDFY' }}</q-tooltip></span>
          </q-td>
          <q-td key="totalSlash" :props="props">
            <span>{{ formatToken('TDFY', props.row.totalSlash, 4) }}<q-tooltip>{{ formatToken('TDFY', props.row.totalSlash) + ' TDFY' }}</q-tooltip></span>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useQuery } from '@urql/vue'
import { extend } from 'quasar'
import { trimHash } from 'src/utils/addresses'
import { useActiveBondsStore } from 'src/stores/activeBonds'
import { formatToken } from 'src/utils/tokens'
import { formatDateTimeInternational } from 'src/utils/time'
import { tidechainExplorerUrl, bondingEntityUrl, rowsPerPageOptions } from 'src/utils/constants'

import Identicon from 'src/components/Identicon.vue'

export default {
  name: 'Deposits',

  components: {
    Identicon
  },

  setup () {
    const activeBondsStore = useActiveBondsStore()
    const currentPage = ref(activeBondsStore.pagination.page)
    const pagination = ref(activeBondsStore.pagination)
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
          query MyQuery($first: Int! = 10, $after: String) {
            stakersConnection(orderBy: id_ASC, first: $first, after: $after) {
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

    const variables = computed(() => activeBondsStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (activeBondsStore.pagination.rowsPerPage === 0) return 1
      if (activeBondsStore.pagination.rowsNumber % activeBondsStore.pagination.rowsPerPage) extra = 1
      return activeBondsStore.pagination.rowsNumber / activeBondsStore.pagination.rowsPerPage + extra
    })

    const result = activeBondsQuery()

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      activeBondsStore.pagination.rowsNumber = data.stakersConnection.totalCount

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
      activeBondsStore.data.splice(0, activeBondsStore.data.length, ...mapped)
    })

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = activeBondsStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = activeBondsStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      activeBondsStore.variables.first = first
      activeBondsStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = activeBondsStore.pagination = extend(false, activeBondsStore.pagination, props.pagination)

      setVariables(first, after)
    }

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: activeBondsStore.data,
      pagination,
      onRequest,
      maxPages,
      currentPage,
      trimHash,
      formatToken,
      formatDateTimeInternational,
      tidechainExplorerUrl,
      rowsPerPageOptions,
      bondingEntityUrl
    }
  }
}
</script>
