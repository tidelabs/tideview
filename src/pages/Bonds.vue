<template>
  <q-page padding>
    <q-table
      id="bonds-data"
      title="Bonds"
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
          <q-td key="blockNumber" :props="props">
            <a :href="tidechainExplorerUrl + props.row.blockNumber" target="_blank" class="external-link">
              {{ props.row.blockNumber }}
            </a>
          </q-td>

          <q-td key="timestamp" :props="props">
            {{  formatDateTimeInternational(props.row.timestamp) }}
          </q-td>

          <q-td key="accountId" :props="props" >
            <identicon :address="props.row.accountId" />
            <a :href="bondingEntityUrl + props.row.accountId" target="_blank" class="external-link">
              <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.accountId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
              <span v-else class="q-ml-sm">{{ props.row.accountId }}</span>
            </a>
            <!-- <router-link
              :to="{ name: 'account', params: { address: props.row.accountId } }"
              class="entity-link"
            >
              <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.accountId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
              <span v-else class="q-ml-sm">{{ props.row.accountId }}</span>
            </router-link> -->
          </q-td>

          <q-td key="amount" :props="props">
            <span>{{ formatToken('TDFY', props.row.amount, 4) }}<q-tooltip>{{ formatToken('TDFY', props.row.amount) + ' TDFY' }}</q-tooltip></span>
          </q-td>

          <q-td key="type" :props="props">
            {{  props.row.type }}
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
import { useBondsStore } from 'src/stores/bonds'
import { formatToken } from 'src/utils/tokens'
import { formatDateTimeInternational } from 'src/utils/time'
import { tidechainExplorerUrl, bondingEntityUrl, rowsPerPageOptions } from 'src/utils/constants'
import { matCheckCircle, matCancel } from 'src/utils/icons'

import Identicon from 'src/components/Identicon.vue'

export default {
  name: 'Bonds',

  components: {
    Identicon
  },

  setup () {
    const bondsStore = useBondsStore()
    const currentPage = ref(bondsStore.pagination.page)
    const pagination = ref(bondsStore.pagination)

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
        label: 'Type',
        name: 'type',
        field: 'type',
        required: true,
        align: 'left',
        sortable: false
      }
    ]

    function bondsQuery () {
      const result = useQuery({
        query: `
          query MyQuery($first: Int! = 10, $after: String) {
            bondsConnection(orderBy: blockNumber_DESC, first: $first, after: $after) {
              totalCount
              edges {
                node {
                  account {
                    id
                  }
                  amount
                  blockNumber
                  extrinsicHash
                  id
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

    const variables = computed(() => bondsStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (bondsStore.pagination.rowsPerPage === 0) return 1
      if (bondsStore.pagination.rowsNumber % bondsStore.pagination.rowsPerPage) extra = 1
      return bondsStore.pagination.rowsNumber / bondsStore.pagination.rowsPerPage + extra
    })

    const result = bondsQuery()

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      bondsStore.pagination.rowsNumber = data.bondsConnection.totalCount

      const mapped = data.bondsConnection.edges.map((d) => {
        return {
          accountId: d.node.account.id,
          amount: d.node.amount,
          type: d.node.type,
          blockNumber: d.node.blockNumber,
          // extrinsicHash: d.node.extrinsicHash,
          // proposalHash: d.node.proposalHash,
          timestamp: d.node.timestamp,
          // transactionId: d.node.transactionId,
          id: d.node.id
        }
      })
      bondsStore.data.splice(0, bondsStore.data.length, ...mapped)
    })

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = bondsStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = bondsStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      bondsStore.variables.first = first
      bondsStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = bondsStore.pagination = extend(false, bondsStore.pagination, props.pagination)

      setVariables(first, after)
    }

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: bondsStore.data,
      pagination,
      onRequest,
      maxPages,
      currentPage,
      trimHash,
      formatToken,
      formatDateTimeInternational,
      tidechainExplorerUrl,
      rowsPerPageOptions,
      matCheckCircle,
      matCancel,
      bondingEntityUrl
    }
  }
}
</script>
