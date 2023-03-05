<template>
  <q-page padding>
    <q-table
      id="deposits-data"
      title="Deposits"
      dense
      :loading="loading"
      :columns="columns"
    />
  </q-page>
</template>

<script>
import { ref, onBeforeMount } from 'vue'

export default {
  name: 'Deposits',
  setup () {
    const loading = ref(false)
    const columns = [

    ]

    onBeforeMount(() => {
      //
    })

    return {
      loading,
      columns
    }
  }
}
</script>
