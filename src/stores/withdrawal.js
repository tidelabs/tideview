import { defineStore } from 'pinia'

export const useWithdrawalStore = defineStore('withdrawal', {
  state: () => ({
    data: []
  })
})
