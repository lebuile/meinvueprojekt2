<template>
  <li>
    {{ movie.title }} – {{ movie.genre }} –
    <span v-if="movie.watched">✅ gesehen</span>
    <span v-else>❌</span>
  </li>
</template>

<script setup>
defineProps({
  movie: Object
})
</script>
