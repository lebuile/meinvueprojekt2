<template>
  <div>
    <h1>Watchlist</h1>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'WatchlistView',
  setup() {
    const items = ref([]);

    onMounted(() => {
      const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL;
      const requestOptions = {
        method: 'GET',
        redirect: 'follow' as RequestRedirect
      };
      fetch(`${baseUrl}/watchlist`, requestOptions)
        .then(response => response.json())
        .then(data => {
          items.value = data;
        })
        .catch(error => {
          console.error('Fehler beim Laden:', error);
        });
    });

    return { items };
  }
});
</script>
