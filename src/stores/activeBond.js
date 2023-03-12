import { defineStore } from 'pinia'

export const useActiveBondStore = defineStore('activeBond', {
  state: () => ({
    data: []
  })
})
