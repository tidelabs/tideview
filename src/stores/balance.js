import { defineStore } from 'pinia'

export const useBalanceStore = defineStore('balance', {
  state: () => ({
    data: []
  })
})
