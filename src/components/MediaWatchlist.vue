<template>
  <div>
    <h2>Meine Medienliste</h2>
    <div class="filter-controls">
      <button @click="loadAll">Alle</button>
      <button @click="loadMovies">Nur Filme</button>
      <button @click="loadSeries">Nur Serien</button>
      <button @click="loadWatched">Gesehen</button>
      <button @click="loadUnwatched">Ungesehen</button>
      <button @click="showAddModal = true">Neues Medium hinzufügen</button>
    </div>

    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <AddMedia @media-added="onMediaAdded" />
        <button @click="showAddModal = false">Schließen</button>
      </div>
    </div>

    <ul>
      <MediaItem
        v-for="media in mediaList"
        :key="media.id"
        :media="media"
        @delete="deleteMedia"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MediaItem from './MediaItem.vue'
import AddMedia from './AddMedia.vue'
import type { Media } from '../types/media'

const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
const mediaList = ref<Media[]>([])
const showAddModal = ref(false)

const loadAll = async () => {
  const response = await axios.get(`${baseUrl}/watchlist`)
  mediaList.value = response.data
}

const loadMovies = async () => {
  const response = await axios.get(`${baseUrl}/watchlist/type/MOVIE`)
  mediaList.value = response.data
}

const loadSeries = async () => {
  const response = await axios.get(`${baseUrl}/watchlist/type/SERIES`)
  mediaList.value = response.data
}

const loadWatched = async () => {
  const response = await axios.get(`${baseUrl}/watchlist/watched`)
  mediaList.value = response.data
}

const loadUnwatched = async () => {
  const response = await axios.get(`${baseUrl}/watchlist/unwatched`)
  mediaList.value = response.data
}

const deleteMedia = async (id: number) => {
  await axios.delete(`${baseUrl}/watchlist/${id}`)
  await loadAll()
}

const onMediaAdded = async () => {
  showAddModal.value = false
  await loadAll()
}

onMounted(loadAll)
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
