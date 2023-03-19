import { computed } from 'vue'
import { useFilterStore } from 'src/stores/filter'
import { quasarDateTimeToISOFormat } from 'src/utils/time'

export default function ({ paginationVariables, useAccount, selectedAddress }) {
  const filterStore = useFilterStore()

  const variables = computed(() => {
    const vars = {
      ...paginationVariables.value
    }
    // console.log('filterStore:', JSON.stringify(filterStore.data, null, 2))
    if (filterStore.useFilter) {
      if (filterStore.token) {
        vars.assetFrom_eq = filterStore.token
        vars.assetTo_eq = filterStore.token
        vars.asset_eq = filterStore.token
      }
      if (filterStore.dateStart) {
        vars.timestamp_lte = quasarDateTimeToISOFormat(filterStore.dateStart)
      }
      if (filterStore.dateEnd) {
        vars.timestamp_gte = quasarDateTimeToISOFormat(filterStore.dateEnd)
      }
      if (useAccount && selectedAddress.value) {
        vars.id_eq = selectedAddress.value
      }
    }

    // console.log(JSON.stringify(vars, null, 2))

    return vars
  })

  return {
    variables
  }
}
