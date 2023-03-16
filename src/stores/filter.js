import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const useFilterStore = defineStore('filter', {
  state: () => ({
    data: {
      useFilter: false,
      dates: {
        dateStart: null,
        dateEnd: null
      },
      token: null
    }
  }),

  getters: {
    useFilter (state) {
      return state.data.useFilter
    },
    dateStart (state) {
      return state.data.dates.dateStart
    },
    dateEnd (state) {
      return state.data.dates.dateEnd
    },
    token (state) {
      return state.data.token
    }
  },

  actions: {
    saveFilters () {
      LocalStorage.set('tideViewFilters', this.data)
    },
    restoreFilters () {
      if (LocalStorage.has('tideViewFilters')) {
        this.data = {
          ...this.filters, // keeps any new defaults added
          ...LocalStorage.getItem('tideViewFilters')
        }
      }
    },
    updateUseFilter (val) {
      this.data.useFilter = val
      this.saveFilters()
    },
    updateDateStart (date) {
      this.data.dates.dateStart = date || null
      this.saveFilters()
    },
    updateDateEnd (date) {
      this.data.dates.dateEnd = date || null
      this.saveFilters()
    },
    updateToken (token) {
      this.data.token = token || null
      this.saveFilters()
    },
    clearToken () {
      this.data.token = null
      this.saveFilters()
    }
  }
})
