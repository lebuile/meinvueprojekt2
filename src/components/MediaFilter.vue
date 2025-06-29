<template>
  <select @change="$emit('filter-change', $event.target.value)">
    <option value="">Alle</option>
    <option value="MOVIE">Film</option>
    <option value="SERIES">Serie</option>
  </select>
</template>

<script setup lang="ts">
defineEmits(['filter-change'])
</script>
