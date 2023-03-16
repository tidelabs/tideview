<template>
  <div>
    <q-table
      id="reward-data"
      title="Rewards"
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

          <q-td key="era" :props="props">
            {{ props.row.era }}
          </q-td>

          <q-td key="timestamp" :props="props">
            <DateTimeInternational :timestamp="props.row.timestamp" />
          </q-td>

          <q-td key="accountId" :props="props" >
            <Account :accountId="props.row.accountId" :selectedAccount="account" />
          </q-td>

          <q-td key="amount" :props="props">
            <TokenDisplay symbol="TDFY" :amount="props.row.amount" />
          </q-td>

          <q-td key="validatorId" :props="props" >
            <Account :accountId="props.row.validatorId" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useQuery } from '@urql/vue'
import { useRewardStore } from 'src/stores/reward'
import { rowsPerPageOptions } from 'src/utils/constants'
import { matCheckCircle, matCancel } from 'src/utils/icons'
import usePagination from 'src/utils/usePagination'

import Pagination from 'src/components/Pagination.vue'
import BlockNumber from './BlockNumber.vue'
import DateTimeInternational from './DateTimeInternational.vue'
import Account from './Account.vue'
import TokenDisplay from './TokenDisplay.vue'

export default {
  name: 'Reward',

  components: {
    Pagination,
    BlockNumber,
    DateTimeInternational,
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
    const rewardStore = useRewardStore()
    const selectedAddress = ref(props.account || null)

    // rewardStore.data.splice(0, rewardStore.data.length)

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
        label: 'Era',
        name: 'era',
        field: 'era',
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
        label: 'Validator',
        name: 'validatorId',
        field: 'validatorId',
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
      account: props.account,
      useAccount: props.useAccount,
      selectedAddress
    })

    const query = computed(() => {
      return `
        query MyQuery($first: Int! = 10, $after: String, $id_eq: String) {
          rewardsConnection(orderBy: blockNumber_DESC, first: $first, after: $after, where: {account: {id_eq: $id_eq}}) {
            totalCount
            edges {
              node {
                account {
                    id
                  }
                amount
                blockNumber
                era
                extrinsicHash
                id
                timestamp
                validatorId
              }
            }
          }
        }
      `
    })

    const variables = computed(() => {
      return {
        ...paginationVariables.value
      }
    })

    const result = useQuery({
      query,
      variables,
      requestPolicy: 'network-only'
    })

    watch(result.error, (error) => {
      console.log(error)
    })

    watch(result.data, (data) => {
      if (!data) {
        rewardStore.data.splice(0, rewardStore.data.length)
        return
      }

      // total rows available
      pagination.value.rowsNumber = data.rewardsConnection.totalCount
      // console.log(data.rewardsConnection.edges)
      const mapped = data.rewardsConnection.edges.map((d) => {
        return {
          accountId: d.node.account.id,
          amount: d.node.amount,
          validatorId: d.node.validatorId,
          blockNumber: d.node.blockNumber,
          era: d.node.era,
          // extrinsicHash: d.node.extrinsicHash,
          // proposalHash: d.node.proposalHash,
          timestamp: d.node.timestamp,
          // transactionId: d.node.transactionId,
          id: d.node.id
        }
      })
      rewardStore.data.splice(0, rewardStore.data.length, ...mapped)
      // console.log(rewardStore.data)
    })

    watch(() => props.account, (val) => {
      selectedAddress.value = val
    })

    return {
      loading: result.fetching,
      error: result.error,
      columns,
      data: rewardStore.data,
      pagination,
      onRequest,
      maxPages,
      currentPage,
      rowsPerPageOptions,
      matCheckCircle,
      matCancel
    }
  }
}
</script>
