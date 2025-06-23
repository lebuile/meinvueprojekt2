<template>
  <li class="media-item">
    <div class="media-info">
      <span class="title">{{ media.title }}</span>
      <span class="genre">{{ media.genre }}</span>
      <span class="type">{{ media.type === 'MOVIE' ? 'Film' : 'Serie' }}</span>
      <span class="status">{{ media.watched ? 'Gesehen' : 'Nicht gesehen' }}</span>
    </div>
    <button @click="$emit('delete', media.id)">Löschen</button>
  </li>
</template>

<script setup lang="ts">
import type { Media } from '../types/media'

defineProps<{
  media: Media
}>()

defineEmits(['delete'])
</script>

<style scoped>
.media-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

.media-info {
  display: flex;
  gap: 1rem;
}
</style>
