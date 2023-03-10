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

          <q-td key="fromId" :props="props" >
            <div v-if="props.row.fromId === selectedAddress"><q-badge>This Account</q-badge></div>
            <div v-else>
              <identicon :address="props.row.fromId" />
              <!-- <a :href="bondingEntityUrl + props.row.fromId" target="_blank" class="external-link">
                <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.fromId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
                <span v-else class="q-ml-sm">{{ props.row.fromId }}</span>
              </a> -->
              <router-link
                :to="{ name: 'history', params: { address: props.row.fromId } }"
                class="entity-link"
              >
                <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.fromId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
                <span v-else class="q-ml-sm">{{ props.row.fromId }}</span>
              </router-link>
            </div>
          </q-td>

          <q-td key="toId" :props="props" >
            <div v-if="props.row.toId === selectedAddress"><q-badge>This Account</q-badge></div>
            <div v-else>
              <identicon :address="props.row.toId" />
              <!-- <a :href="bondingEntityUrl + props.row.toId" target="_blank" class="external-link">
                <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.toId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
                <span v-else class="q-ml-sm">{{ props.row.toId }}</span>
              </a> -->
              <router-link
                :to="{ name: 'history', params: { address: props.row.toId } }"
                class="entity-link"
              >
                <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.toId, 16) }}<q-tooltip>{{ props.row.fromId }}</q-tooltip></span>
                <span v-else class="q-ml-sm">{{ props.row.toId }}</span>
              </router-link>
            </div>
          </q-td>

          <q-td key="amount" :props="props">
            <span>{{ formatToken(props.row.asset, props.row.amount, 4) }}<q-tooltip>{{ formatToken(props.row.asset, props.row.amount) + ' ' + props.row.asset }}</q-tooltip></span>
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
import { extend } from 'quasar'
import { trimHash } from 'src/utils/addresses'
import { useTransferStore } from 'src/stores/transfer'
import { formatToken } from 'src/utils/tokens'
import { formatDateTimeInternational } from 'src/utils/time'
import { tidechainExplorerUrl, bondingEntityUrl, rowsPerPageOptions } from 'src/utils/constants'
import { matCheckCircle, matCancel } from 'src/utils/icons'

import Identicon from 'src/components/Identicon.vue'

export default {
  name: 'Transfer',

  components: {
    Identicon
  },

  props: {
    account: String
  },

  setup (props) {
    const transferStore = useTransferStore()
    const currentPage = ref(transferStore.pagination.page)
    const pagination = ref(transferStore.pagination)
    const selectedAddress = ref(props.account)

    transferStore.variables.id_eq = selectedAddress.value

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

    function transfersQuery () {
      const result = useQuery({
        query: `
          query MyQuery($first: Int! = 10, $after: String, $id_eq: String) {
            transfersConnection(orderBy: blockNumber_DESC, first: $first, after: $after, where: {from: {id_eq: $id_eq}, OR: {to: {id_eq: $id_eq}}}) {
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
        `,
        variables
      })

      return result
    }

    const variables = computed(() => transferStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (transferStore.pagination.rowsPerPage === 0) return 1
      if (transferStore.pagination.rowsNumber % transferStore.pagination.rowsPerPage) extra = 1
      return transferStore.pagination.rowsNumber / transferStore.pagination.rowsPerPage + extra
    })

    watch(() => props.account, () => {
      selectedAddress.value = props.account
    })

    watch(selectedAddress, () => {
      transferStore.variables.id_eq = selectedAddress.value
    })

    const result = transfersQuery()

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      transferStore.pagination.rowsNumber = data.transfersConnection.totalCount

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

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = transferStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = transferStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      transferStore.variables.first = first
      transferStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = transferStore.pagination = extend(false, transferStore.pagination, props.pagination)

      setVariables(first, after)
    }

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: transferStore.data,
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
      bondingEntityUrl,
      selectedAddress
    }
  }
}
</script>
