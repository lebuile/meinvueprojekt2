<template>
  <div>
    <h2>Meine Watchlist</h2>
    <ul>
      <WatchlistItem
        v-for="movie in watchlist"
        :key="movie.title"
        :movie="movie"
      />
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import WatchlistItem from './WatchlistItem.vue'

const watchlist = ref([])

onMounted(async () => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL;
  const response = await axios.get(baseUrl + '/watchlist')
  watchlist.value = response.data
})
</script>
