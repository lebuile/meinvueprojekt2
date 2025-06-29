<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav>
    <RouterLink to="/" class="nav-link">Home</RouterLink>
    <RouterLink to="/about" class="nav-link">About</RouterLink>
  </nav>
</template>

<style scoped>
nav {
  padding: 1rem;
}
.nav-link {
  margin-right: 1rem;
  text-decoration: none;
  color: #333;
}
.router-link-active {
  color: #42b983;
  font-weight: bold;
}
</style>