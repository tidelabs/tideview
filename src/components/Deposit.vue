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
          <q-td key="amount" :props="props">
            <span>{{ formatToken(props.row.asset, props.row.amount, 4) }}<q-tooltip>{{ formatToken(props.row.asset, props.row.amount) + ' ' + props.row.asset }}</q-tooltip></span>
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
import { extend } from 'quasar'
import { trimHash } from 'src/utils/addresses'
import { useDepositStore } from 'src/stores/deposit'
import { formatToken } from 'src/utils/tokens'
import { formatDateTimeInternational } from 'src/utils/time'
import { tidechainExplorerUrl, bondingEntityUrl, rowsPerPageOptions } from 'src/utils/constants'

// import Identicon from 'src/components/Identicon.vue'

export default {
  name: 'Deposits',

  // components: {
  //   Identicon
  // },

  props: {
    account: String
  },

  setup (props) {
    const depositStore = useDepositStore()
    const currentPage = ref(depositStore.pagination.page)
    const pagination = ref(depositStore.pagination)
    const selectedAddress = ref(props.account)

    depositStore.variables.id_eq = selectedAddress.value

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
      // {
      //   label: 'Account',
      //   name: 'accountId',
      //   field: 'accountId',
      //   required: true,
      //   align: 'left',
      //   sortable: false
      // },
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

    function depositsQuery () {
      const result = useQuery({
        query: `
          query MyQuery($first: Int! = 10, $after: String, $id_eq: String) {
            depositsConnection(orderBy: blockNumber_DESC, first: $first, after: $after, where: {account: {id_eq: $id_eq}}) {
              totalCount
              edges {
                node {
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
        `,
        variables
      })

      return result
    }

    const variables = computed(() => depositStore.variables)

    const maxPages = computed(() => {
      let extra = 0
      if (depositStore.pagination.rowsPerPage === 0) return 1
      if (depositStore.pagination.rowsNumber % depositStore.pagination.rowsPerPage) extra = 1
      return depositStore.pagination.rowsNumber / depositStore.pagination.rowsPerPage + extra
    })

    watch(() => props.account, () => {
      selectedAddress.value = props.account
    })

    watch(selectedAddress, () => {
      depositStore.variables.id_eq = selectedAddress.value
    })

    const result = depositsQuery()

    watch(result.data, (data) => {
      if (!data) return

      // total rows available
      depositStore.pagination.rowsNumber = data.depositsConnection.totalCount

      const mapped = data.depositsConnection.edges.map((d) => {
        return {
          // accountId: d.node.account.id,
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

    watch(currentPage, (page) => {
      const { rowsPerPage, rowsNumber } = depositStore.pagination

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
      pagination.value.page = depositStore.pagination.page = page
      setVariables(first, after)
    })

    function setVariables (first = 10, after = null) {
      depositStore.variables.first = first
      depositStore.variables.after = after
    }

    function onRequest (props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination

      if (currentPage.value !== page) currentPage.value = page

      const first = rowsPerPage === 0 ? rowsNumber : rowsPerPage
      const after = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

      pagination.value = depositStore.pagination = extend(false, depositStore.pagination, props.pagination)

      setVariables(first, after)
    }

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: depositStore.data,
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
