import { defineStore } from 'pinia'

export const useWithdrawalsStore = defineStore('withdrawals', {
  state: () => ({
    data: [],
    pagination: {
      // sortBy: 'desc',
      // descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 100
    },
    variables: {
      first: 10,
      after: null
    }
  })
})
