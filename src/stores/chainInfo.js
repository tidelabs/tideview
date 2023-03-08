import { defineStore } from 'pinia'

export const useChainInfoStore = defineStore('chainInfo', {
  state: () => ({
    chainInfo: {
      tokens: []
    }
  }),

  getters: {
    getTokens (state) {
      return state.chainInfo.tokens
    }
  }
})
