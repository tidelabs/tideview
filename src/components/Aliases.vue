<template>
  <div>
    <q-dialog
      v-model="showConfirmDialog"
    >
      <q-card style="min-width: 300px;">
        <q-card-section>
          <div class="text-h6">Confirm delete for: </div>
          <q-separator />
          <div class="row">
            <span style="min-width: 60px;">Name:</span><span>{{ aliasName }}</span>
          </div>
          <div class="row">
            <span style="min-width: 60px;">Address:</span><span class="ellipsis">{{ aliasAddress }}</span>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions vertical>
          <q-btn
            label="Remove"
            flat
            no-caps
            @click="onRemoveAlias"
          />
          <q-btn
            label="Cancel"
            flat
            no-caps
            @click="showConfirmDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="showAliasDialog"
    >
      <q-card style="min-width: 300px;">
        <q-card-section>
          <div class="text-h6">Add: </div>
          <div class="q-gutter-xs">
            <q-input
              outlined
              v-model="aliasAddress"
              label="Address"
              :color="$q.dark.isActive ? 'yellow-13' : 'primary'"
              :rules="[val => isValidAddress(val)  || 'Invalid address', val => isAddressAvailable(val) || 'Address already used']"
            />
            <q-input
              outlined
              v-model="aliasName"
              label="Name"
              :color="$q.dark.isActive ? 'yellow-13' : 'primary'"
            />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions vertical>
          <q-btn
            flat
            :disable="shouldDisableSave"
            @click="onSaveAlias"
          >Save</q-btn>
          <q-btn
            flat
            @click="showAliasDialog = false"
          >Cancel</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="q-mb-sm">
      <q-input
        v-model="filteredAlias"
        label="Filter by alias"
        outlined
        clearable
        :color="$q.dark.isActive ? 'yellow-13' : 'primary'"
        style="min-width: 100%; max-height: 56px;"
        class="ellipsis"
      />
    </div>
    <div class="row justify-center items-center q-gutter-sm q-mb-sm">
      <q-btn
        no-caps
        icon="add"
        rounded
        @click="showAliasDialog = true; aliasName = ''; aliasAddress = ''"
        style="font-size: 10px;"
      ><q-tooltip>Add alias</q-tooltip></q-btn>
      <q-btn
        no-caps
        :icon="bxExport"
        rounded
        @click="onExport"
        style="font-size: 10px;"
      ><q-tooltip>Export</q-tooltip></q-btn>
      <q-btn
        no-caps
        :icon="bxImport"
        rounded
        @click="onImport"
        style="font-size: 10px;"
      ><q-tooltip>Import</q-tooltip></q-btn>
    </div>

    <div class="position-relative q-ma-none" style="height: calc(100vh - 216px); margin-left: -16px; margin-bottom: -16px; width: 298px;">
      <q-scroll-area class="fit">
        <template v-if="filteredAliases.length > 0">
          <template v-for="( alias, index ) in filteredAliases" :key="alias.address + '_' + index">
            <q-item style="height: 48px; padding: 4px 8px; width: 288px;">
              <q-item-section top>
                <q-item-label><Identicon :address="alias.address" class="q-mr-xs"/>{{ alias.name }}</q-item-label>
                <q-item-label caption style="font-size: 11px;" class="ellipsis">
                  <router-link
                    :to="{ name: 'history', params: { address: alias.address } }"
                    class="entity-link"
                  >
                    {{ alias.address }}
                    <q-tooltip>{{ alias.address }}</q-tooltip>
                  </router-link>
                </q-item-label>
              </q-item-section>
              <q-item-section side class="overflow-hidden">
                <div class="text-grey-8 q-gutter-xs">
                  <q-btn class="" size="10px" flat dense round icon="delete" @click="aliasAddress = alias.address; aliasName = alias.name; showConfirmDialog = true;"/>
                  <!-- <q-btn class="" size="10px" flat dense round icon="edit"/> -->
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
          </template>
        </template>
      </q-scroll-area>
    </div>

  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { bxExport, bxImport } from 'src/utils/icons'
import { exportFile, useQuasar } from 'quasar'
import { useAliasStore } from 'src/stores/alias'
import { isValidAddress } from 'src/utils/addresses'
import Identicon from './Identicon.vue'
import { merge } from 'src/utils/merge'

export default {
  name: 'Aliases',

  components: {
    Identicon
  },

  setup () {
    const $q = useQuasar()
    const aliasStore = useAliasStore()
    const filteredAlias = ref('')
    const showAliasDialog = ref(false)
    const showConfirmDialog = ref(false)
    const aliasName = ref('')
    const aliasAddress = ref('')

    // filter aliases by user value
    const filteredAliases = computed(() => {
      // return all if nothing to filter from
      if (!filteredAlias.value) {
        return aliasStore.aliases
      }
      // find aliases that match
      const filtered = []
      const contact = filteredAlias.value.toLowerCase()
      aliasStore.aliases.forEach((alias) => {
        if (alias.name.toLowerCase().indexOf(contact) > -1) {
          filtered.push(alias)
        }
      })
      return filtered
    })

    const shouldDisableSave = computed(() => {
      if (aliasName.value && aliasAddress.value) {
        if (!aliasExists(aliasName.value)) {
          if (isValidAddress(aliasAddress.value)) {
            if (isAddressAvailable(aliasAddress.value)) {
              return false
            }
          }
        }
      }
      return true
    })

    function aliasExists (name) {
      return !!aliasStore.getAliases.find((alias) => alias.name === name)
    }

    function onSaveAlias () {
      aliasStore.addAlias(aliasAddress.value, aliasName.value)
      showAliasDialog.value = false
    }

    function onRemoveAlias () {
      aliasStore.removeAlias(aliasAddress.value, aliasName.value)
      showConfirmDialog.value = false
    }

    function isAddressAvailable (address) {
      return !aliasStore.getAlias(address)
    }

    function onExport () {
      if (exportFile('aliases.json', JSON.stringify(aliasStore.aliases), 'application/json')) {
        // success!
        $q.notify({
          message: 'Aliases saved!!',
          position: 'top-right'
        })
      }
      else {
        $q.notify({
          type: 'negative',
          message: 'Aliases export failed!!',
          position: 'top-right'
        })
      }
    }

    async function onImport () {
      const pickerOpts = {
        types: [
          {
            description: 'JSON',
            accept: {
              'application/json': ['.json']
            }
          }
        ],
        excludeAcceptAllOption: true,
        multiple: false
      }

      try {
        // read aliases in case they have changed from a different browser instance
        aliasStore.restoreAliases()
        // get file from user
        const [fileHandle] = await window.showOpenFilePicker(pickerOpts)
        const file = await fileHandle.getFile()
        const contents = JSON.parse(await file.text())
        // console.log('filePicker:', file, contents)
        const { uniques } = merge(aliasStore.aliases, contents)
        aliasStore.aliases.push(...uniques)
        aliasStore.saveAliases()
        $q.notify({
          message: 'Aliases imported!!',
          position: 'top-right'
        })
      }
      catch (e) {
        console.log(e)
        $q.notify({
          type: 'negative',
          message: 'Aliases import failed!!',
          // caption: e,
          position: 'top-right'
        })
      }
    }

    return {
      bxExport,
      bxImport,
      onExport,
      onImport,
      filteredAliases,
      filteredAlias,
      showAliasDialog,
      showConfirmDialog,
      aliasName,
      aliasAddress,
      aliasExists,
      isValidAddress,
      onSaveAlias,
      onRemoveAlias,
      isAddressAvailable,
      shouldDisableSave

    }
  }
}
</script>
