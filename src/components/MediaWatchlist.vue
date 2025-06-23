<template>
  <div>
    <h2>Meine Medienliste</h2>
    <div class="filter-controls">
      <button @click="loadAll" :class="{ active: !hasActiveFilters }">Alle</button>
      <button @click="loadMovies" :class="{ active: isMovieFilter }">Nur Filme</button>
      <button @click="loadSeries" :class="{ active: isSeriesFilter }">Nur Serien</button>
      <button @click="loadWatched">Gesehen</button>
      <button @click="loadUnwatched">Ungesehen</button>

      <select v-model="currentGenre" class="genre-dropdown" @change="onGenreChange">
        <option value="">Genre auswählen</option>
        <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
      </select>

      <div v-if="selectedGenres.length > 0" class="selected-genres">
        <span
          v-for="genre in selectedGenres"
          :key="genre"
          class="genre-tag"
          @click="removeGenre(genre)"
        >
          {{ genre }} ✕
        </span>
      </div>

      <button @click="resetFilters" class="reset-button">Filter zurücksetzen</button>
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
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import MediaItem from './MediaItem.vue'
import AddMedia from './AddMedia.vue'
import type { Media } from '../types/media'

const selectedGenres = ref<string[]>([])
const currentGenre = ref<string>('')
const genres = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi']

const isMovieFilter = ref(false)
const isSeriesFilter = ref(false)

const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
const mediaList = ref<Media[]>([])
const showAddModal = ref(false)

const hasActiveFilters = computed(() => {
  return selectedGenres.value.length > 0 || isMovieFilter.value || isSeriesFilter.value
})



const onGenreChange = () => {
  if (currentGenre.value && !selectedGenres.value.includes(currentGenre.value)) {
    selectedGenres.value.push(currentGenre.value)
    loadByGenres()
  }
  currentGenre.value = ''
}

const removeGenre = (genre: string) => {
  const index = selectedGenres.value.indexOf(genre)
  if (index > -1) {
    selectedGenres.value.splice(index, 1)
    loadByGenres()
  }
}

const loadAll = async () => {
  selectedGenres.value = []
  isMovieFilter.value = false
  isSeriesFilter.value = false
  const response = await axios.get(`${baseUrl}/watchlist`)
  mediaList.value = response.data
}

const loadMovies = async () => {
  isMovieFilter.value = true
  isSeriesFilter.value = false
  await loadByGenres()
}

const loadSeries = async () => {
  isSeriesFilter.value = true
  isMovieFilter.value = false
  await loadByGenres()
}

const loadWatched = async () => {
  const response = await axios.get(`${baseUrl}/watchlist/watched`)
  mediaList.value = response.data
}

const loadUnwatched = async () => {
  const response = await axios.get(`${baseUrl}/watchlist/unwatched`)
  mediaList.value = response.data
}

const loadByGenres = async () => {
  if (selectedGenres.value.length === 0 && !isMovieFilter.value && !isSeriesFilter.value) {
    await loadAll()
    return
  }

  const params = new URLSearchParams()
  selectedGenres.value.forEach(g => params.append('genres', g))
  if (isMovieFilter.value) {
    params.append('type', 'MOVIE')
  } else if (isSeriesFilter.value) {
    params.append('type', 'SERIES')
  }

  const response = await axios.get(`${baseUrl}/watchlist/filter?${params.toString()}`)
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

const resetFilters = async () => {
  selectedGenres.value = []
  currentGenre.value = ''
  isMovieFilter.value = false
  isSeriesFilter.value = false
  await loadAll()
}

onMounted(loadAll)
</script>

<style scoped>
.filter-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-controls button, .genre-dropdown {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background-color: #f8f9fa;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  height: 36px;
}

.filter-controls button:hover {
  background-color: #e9ecef;
}

.filter-controls button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.genre-dropdown {
  min-width: 140px;
  background-color: white;
  -webkit-appearance: none;
  appearance: none;
}

.genre-dropdown:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.selected-genres {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
}

.genre-tag {
  background-color: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
}

.genre-tag:hover {
  background-color: #0056b3;
}

.reset-button {
  background-color: #dc3545 !important;
  color: white !important;
  border-color: #dc3545 !important;
}

.reset-button:hover {
  background-color: #c82333 !important;
  border-color: #bd2130 !important;
}

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
