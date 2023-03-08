import { defineStore } from 'pinia'

export const useTransfersStore = defineStore('transfers', {
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