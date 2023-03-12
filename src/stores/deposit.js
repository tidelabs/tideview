import { defineStore } from 'pinia'

export const useDepositStore = defineStore('deposit', {
  state: () => ({
    data: []
  })
})
