import { defineStore } from 'pinia'

export const useAssetsStore = defineStore('assets', {
  state: () => ({
    assets: []
  })
})
