<template>
  <q-pagination
    :max-pages="6"
    boundary-numbers
    :text-color="$q.dark.isActive ? 'yellow' : 'primary'"
    :active-color="$q.dark.isActive ? 'yellow' : 'primary'"
    :active-text-color="$q.dark.isActive ? 'black' : 'white'"
    v-bind="$attrs"
    @update:model-value="$event => $emit('update:modelValue', $event)"
  />
</template>

<script>
export default {
  name: 'Pagination',

  emits: [
    'update:modelValue'
  ]
}
</script>
