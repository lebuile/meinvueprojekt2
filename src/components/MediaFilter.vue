<script setup lang="ts">
import { defineEmits } from 'vue'

const emit = defineEmits<{
  'filter-change': [filter: string]
}>()

const handleFilterChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('filter-change', target.value)
}
</script>

<template>
  <div>
    <select @change="handleFilterChange">
      <option value="">Alle</option>
      <option value="movie">Filme</option>
      <option value="series">Serien</option>
    </select>
  </div>
</template>

<style scoped>
select {
  padding: 0.5rem;
  margin: 0.5rem;
}
</style>
