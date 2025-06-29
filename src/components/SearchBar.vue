<script setup lang="ts">
import { ref } from 'vue'

const searchText = ref('')

const emitSearch = () => {
  emit('search', searchText.value)
}

const emit = defineEmits(['search'])
</script>

<template>
  <div>
    <input
      type="text"
      v-model="searchText"
      @input="emitSearch"
      placeholder="Suche..."
    >
  </div>
</template>

<style scoped>
input {
  padding: 0.5rem;
  width: 200px;
}
</style>
