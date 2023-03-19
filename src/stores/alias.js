import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const useAliasStore = defineStore('alias', {
  state: () => ({
    aliases: []
  }),

  getters: {
    getAliases (state) {
      return state.aliases
    }
  },

  actions: {
    saveAliases () {
      this.sortAliases()
      LocalStorage.set('tideviewAliases', this.aliases)
    },
    restoreAliases () {
      if (LocalStorage.has('tideviewAliases')) {
        this.aliases = LocalStorage.getItem('tideviewAliases')
      }
    },
    addAlias (address, name) {
      this.aliases.push({
        address,
        name
      })
      this.saveAliases()
    },
    removeAlias (address) {
      this.aliases.splice(
        this.aliases.findIndex((alias) => address === alias.address)
        , 1)
      this.saveAliases()
    },
    sortAliases () {
      this.aliases = this.aliases.sort((a, b) => {
        return a.name.toLowerCase() > b.name.toLowerCase()
          ? 1
          : a.name.toLowerCase() < b.name.toLowerCase()
            ? -1 : 0
      })
    },
    getAlias (address) {
      return this.aliases.find((alias) => address === alias.address)
    }
  }
})
