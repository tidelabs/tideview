import { defineStore } from 'pinia'

export const useActiveBondStore = defineStore('activeBond', {
  state: () => ({
    data: [],
    pagination: {
      // sortBy: 'desc',
      // descending: false,
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 100
    },
    variables: {
      first: 10,
      after: null,
      id_eq: null
    }
  })
})
