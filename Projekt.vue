<template>
  <div>
    <h2>Projektliste</h2>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: []
    }
  },
  methods: {
    loadWatchlist() {
      const baseUrl = process.env.VUE_APP_BACKEND_BASE_URL;
      const endpoint = `${baseUrl}/watchlist`;
      const requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };

      fetch(endpoint, requestOptions)
        .then(response => response.json())
        .then(result => {
          this.items = result;
        })
        .catch(error => console.log('Fehler beim Laden:', error));
    }
  },
  mounted() {
    this.loadWatchlist();
  }
}
</script>
