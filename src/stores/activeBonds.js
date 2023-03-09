import { defineStore } from 'pinia'

export const useActiveBondsStore = defineStore('activeBonds', {
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
