<template>
  <div class="column">

    <div>
      <q-checkbox
      v-model="useFilter"
      label="Use filter"
    />
    </div>
    <div class="filter-title">Dates</div>
    <div class="row justify-between items-center q-gutter-sm">
      <div style="max-width: 250px">
        <q-input filled v-model="dateStart" clearable hint="Start date/time (any date/time after)">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="dateStart" mask="YYYY-MM-DD HH:mm">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="dateStart" mask="YYYY-MM-DD HH:mm" format24h>
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div>
        <div style="max-width: 250px">
          <q-input filled v-model="dateEnd" clearable hint="End date/time (any date/time before)">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="dateEnd" mask="YYYY-MM-DD HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-time v-model="dateEnd" mask="YYYY-MM-DD HH:mm" format24h>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <q-separator class="q-mt-sm" />

    <div class="filter-title">Token</div>
    <div>
      <q-select v-model="token" :options="tokenOptions" clearable />
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { debounce } from 'quasar'
import { useFilterStore } from 'src/stores/filter'
import { useAssetsStore } from 'src/stores/assets'

export default {
  name: 'FilterDialog',

  setup () {
    const filterStore = useFilterStore()
    const assetsStore = useAssetsStore()
    const useFilter = ref(filterStore.data.useFilter)
    const dateStart = ref(filterStore.dateStart)
    const dateEnd = ref(filterStore.dateEnd)
    const token = ref(filterStore.token)
    const tokenOptions = ref([])

    // debounce data as QTime updates for every tick
    const updateDateStart = debounce(filterStore.updateDateStart, 10)
    const updateDateEnd = debounce(filterStore.updateDateEnd, 10)

    function updateAssets () {
      // remove any existing
      tokenOptions.value.splice(0, tokenOptions.value.length)
      // add token symbols from Assets Store
      assetsStore.assets.forEach((asset) => { tokenOptions.value.push(asset.symbol) })
      // add TDFY (not included as an Asset)
      tokenOptions.value.push('TDFY')
    }

    watch(useFilter, (val) => filterStore.updateUseFilter(val))

    watch(assetsStore.assets, (assets) => {
      updateAssets()
    })

    watch(dateStart, (val) => {
      // console.log('dateStart:', val)
      updateDateStart(val)
    })

    watch(dateEnd, (val) => {
      // console.log('startEnd:', val)
      updateDateEnd(val)
    })

    watch(token, (val) => {
      filterStore.updateToken(val)
    })

    updateAssets()

    return {
      filterStore,
      useFilter,
      dateStart,
      dateEnd,
      token,
      tokenOptions
    }
  }
}
</script>

<style lang="scss">
.filter-title {
  font-size: 20px;
}
</style>
