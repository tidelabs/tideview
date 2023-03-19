import { ref, computed, watch } from 'vue'
import { extend } from 'quasar'

export default function ({
  useAccount,
  selectedAddress
}) {
  const first = ref(useAccount ? 5 : 10)
  const after = ref(null)

  const pagination = ref({
    page: 1,
    rowsPerPage: first.value,
    rowsNumber: 1
  })
  const currentPage = ref(pagination.value.page)

  const paginationVariables = computed(() => {
    const vars = {
      first: first.value,
      after: after.value
    }
    if (useAccount) {
      vars.id_eq = selectedAddress.value || null
    }
    return vars
  })

  watch(selectedAddress, () => {
    after.value = null // reset to start
  })

  const maxPages = computed(() => {
    let extra = 0
    if (pagination.value.rowsPerPage === 0) return 1
    if (pagination.value.rowsNumber % pagination.value.rowsPerPage) extra = 1
    return pagination.value.rowsNumber / pagination.value.rowsPerPage + extra
  })

  watch(currentPage, (page) => {
    const { rowsPerPage, rowsNumber } = pagination.value

    first.value = rowsPerPage === 0 ? rowsNumber : rowsPerPage
    after.value = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)
    pagination.value.page = page
  })

  function onRequest (props) {
    const { page, rowsPerPage, rowsNumber } = props.pagination

    if (currentPage.value !== page) currentPage.value = page

    first.value = rowsPerPage === 0 ? rowsNumber : rowsPerPage
    after.value = page === 1 ? null : '' + ((page * rowsPerPage) - rowsPerPage)

    pagination.value = extend(false, pagination.value, props.pagination)
  }

  return {
    first,
    after,
    selectedAddress,
    pagination,
    currentPage,
    paginationVariables,
    maxPages,
    onRequest
  }
}
