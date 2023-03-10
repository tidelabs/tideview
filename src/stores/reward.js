import { defineStore } from 'pinia'

export const useRewardStore = defineStore('reward', {
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
      first: 5,
      after: null,
      id_eq: null
    }
  })
})