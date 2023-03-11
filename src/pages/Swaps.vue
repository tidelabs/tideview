<template>
  <q-page padding>
    <q-table
      id="swaps-data"
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
            <!-- <a :href="bondingEntityUrl + props.row.accountId" target="_blank" class="external-link">
              <span v-if="$q.screen.lt.md" class="q-ml-sm">{{ trimHash(props.row.accountId, 16) }}<q-tooltip>{{ props.row.accountId }}</q-tooltip></span>
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

          <q-td key="slippage" :props="props" >
            <Slippage :amount="props.row.slippage" />
          </q-td>

          <q-td key="amountFrom" :props="props">
            <span>{{ formatToken(props.row.assetFrom, props.row.amountFrom, 4) }}<q-tooltip>{{ formatToken(props.row.assetFrom, props.row.amountFrom) + ' ' + props.row.assetFrom }}</q-tooltip></span>
          </q-td>

          <q-td key="assetFrom" :props="props">
            {{  props.row.assetFrom }}
          </q-td>

          <q-td key="amountTo" :props="props">
            <span>{{ formatToken(props.row.assetTo, props.row.amountTo, 4) }}<q-tooltip>{{ formatToken(props.row.assetTo, props.row.amountTo) + ' ' + props.row.assetTo }}</q-tooltip></span>
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
  </q-page>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useQuery } from '@urql/vue'
import { extend } from 'quasar'
import { trimHash } from 'src/utils/addresses'
import { useSwapsStore } from 'src/stores/swaps'
import { formatToken } from 'src/utils/tokens'
import { formatDateTimeInternational } from 'src/utils/time'
import { tidechainExplorerUrl, bondingEntityUrl, rowsPerPageOptions } from 'src/utils/constants'
import { matCheckCircle, matCancel } from 'src/utils/icons'

import Identicon from 'src/components/Identicon.vue'
import Slippage from 'src/components/Slippage.vue'

export default {
  name: 'Swaps',

  components: {
    Identicon,
    Slippage
  },

  setup () {
    const swapsStore = useSwapsStore()
    const currentPage = ref(swapsStore.pagination.page)
    const pagination = ref(swapsStore.pagination)

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

    function swapsQuery () {
      const result = useQuery({
        query: `
          query MyQuery($first: Int! = 10, $after: String) {
            swapsConnection(orderBy: blockNumber_DESC, first: $first, after: $after, where: {type_not_eq: "Limit", isMarketMaker_not_eq: true}) {
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
        `,
        variables
      })

      return result
    }

    const variables = computed(() => swapsStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (swapsStore.pagination.rowsPerPage === 0) return 1
      if (swapsStore.pagination.rowsNumber % swapsStore.pagination.rowsPerPage) extra = 1
      return swapsStore.pagination.rowsNumber / swapsStore.pagination.rowsPerPage + extra
    })

    const result = swapsQuery()

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      swapsStore.pagination.rowsNumber = data.swapsConnection.totalCount

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
          // extrinsicHash: d.node.extrinsicHash,
          // proposalHash: d.node.proposalHash,
          timestamp: d.node.timestamp,
          // transactionId: d.node.transactionId,
          // success: d.node.success,
          id: d.node.id
        }
      })
      swapsStore.data.splice(0, swapsStore.data.length, ...mapped)
    })

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = swapsStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = swapsStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      swapsStore.variables.first = first
      swapsStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = swapsStore.pagination = extend(false, swapsStore.pagination, props.pagination)

      setVariables(first, after)
    }

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: swapsStore.data,
      pagination,
      onRequest,
      maxPages,
      currentPage,
      trimHash,
      formatToken,
      formatDateTimeInternational,
      tidechainExplorerUrl,
      bondingEntityUrl,
      rowsPerPageOptions,
      matCheckCircle,
      matCancel
    }
  }
}
</script>
