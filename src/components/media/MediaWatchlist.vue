<template>
  <div>
    <div class="filter-controls">
      <button @click="loadAll" :class="{ active: !hasActiveFilters }">Alle</button>
      <button @click="loadMovies" :class="{ active: isMovieFilter }">Nur Filme</button>
      <button @click="loadSeries" :class="{ active: isSeriesFilter }">Nur Serien</button>
      <button @click="loadWatched" :class="{ active: isWatchedFilter }">Gesehen</button>
      <button @click="loadUnwatched" :class="{ active: isUnwatchedFilter }">Ungesehen</button>
      <button @click="loadRated" :class="{ active: isRatingFilter && !minRating }">Bewertet</button>

      <select v-model="currentGenre" class="genre-dropdown" @change="onGenreChange">
        <option value="">Genre</option>
        <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
      </select>

      <select v-model="minRating" class="rating-dropdown" @change="onRatingFilterChange">
        <option value="">Bewertung</option>
        <option value="1">⭐</option>
        <option value="2">⭐⭐</option>
        <option value="3">⭐⭐⭐</option>
        <option value="4">⭐⭐⭐⭐</option>
        <option value="5">⭐⭐⭐⭐⭐</option>
      </select>

      <button @click="resetFilters" class="reset-button">Filter zurücksetzen</button>
      <button @click="showAddModal = true" class="add-button">Neue Filme/Serien hinzufügen</button>
    </div>

    <!-- Genre-Tags in separater Zeile -->
    <div v-if="selectedGenres.length > 0" class="selected-genres-row">
      <div class="selected-genres">
        <span
          v-for="genre in selectedGenres"
          :key="genre"
          class="genre-tag"
          @click="removeGenre(genre)"
        >
          {{ genre }} ✕
        </span>
      </div>
    </div>

    <div class="stats-bar">
      <span>Gesamt: {{ mediaList.length }}</span>
      <span>🎬 Filme: {{ movieCount }}</span>
      <span>📺 Serien: {{ seriesCount }}</span>
      <span v-if="ratedCount > 0">Bewertet: {{ ratedCount }}</span>
      <span v-if="averageRating > 0">⌀ Bewertung: {{ averageRating.toFixed(1) }} ⭐</span>
      <span v-if="latestRatingDate" class="latest-rating">
        Letzte Bewertung: {{ formatDate(latestRatingDate) }}
      </span>
    </div>

    <div v-if="showAddModal" class="modal">
      <div class="modal-content">
        <AddMedia @media-added="onMediaAdded" />
        <button @click="showAddModal = false" class="close-btn">Schließen</button>
      </div>
    </div>

    <div v-if="mediaList.length === 0" class="empty-state">
      <p>Keine Medien gefunden. Füge dein erstes Medium hinzu!</p>
    </div>

    <ul v-else class="media-list">
      <MediaItem
        v-for="media in sortedMediaList"
        :key="media.id"
        :media="media"
        @delete="deleteMedia"
        @updated="refreshList"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import MediaItem from './MediaItem.vue'
import AddMedia from './AddMedia.vue'
import type { Media } from '../../types/media.ts'

const selectedGenres = ref<string[]>([])
const currentGenre = ref<string>('')
const minRating = ref<string>('')
const genres = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi']

const isMovieFilter = ref(false)
const isSeriesFilter = ref(false)
const isWatchedFilter = ref(false)
const isUnwatchedFilter = ref(false)
const isRatingFilter = ref(false)

const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
const mediaList = ref<Media[]>([])
const showAddModal = ref(false)

const hasActiveFilters = computed(() => {
  return selectedGenres.value.length > 0 ||
    isMovieFilter.value ||
    isSeriesFilter.value ||
    isWatchedFilter.value ||
    isUnwatchedFilter.value ||
    minRating.value !== '' ||
    isRatingFilter.value
})

const movieCount = computed(() => {
  return mediaList.value.filter(media => media.type === 'MOVIE').length
})

const seriesCount = computed(() => {
  return mediaList.value.filter(media => media.type === 'SERIES').length
})

const latestRatingDate = ref<string | null>(null)

const loadLatestRatingDate = async () => {
  try {
    const response = await axios.get(`${baseUrl}/watchlist/latest-rating-date`)
    latestRatingDate.value = response.data.latestRatingDate
  } catch (error) {
    console.error('Fehler beim Laden des letzten Bewertungsdatums:', error)
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return null

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Heute'
  } else if (diffDays === 1) {
    return 'Gestern'
  } else if (diffDays < 7) {
    return `vor ${diffDays} Tagen`
  } else {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
}

const ratedCount = computed(() => {
  return mediaList.value.filter(media => media.rating && media.rating > 0).length
})

const averageRating = computed(() => {
  const ratedMedias = mediaList.value.filter(media => media.rating && media.rating > 0)
  if (ratedMedias.length === 0) return 0
  const sum = ratedMedias.reduce((acc, media) => acc + (media.rating || 0), 0)
  return sum / ratedMedias.length
})

const sortedMediaList = computed(() => {
  return [...mediaList.value].sort((a, b) => {
    if (a.rating && b.rating) {
      if (a.rating !== b.rating) {
        return b.rating - a.rating
      }
    } else if (a.rating && !b.rating) {
      return -1
    } else if (!a.rating && b.rating) {
      return 1
    }
    return a.title.localeCompare(b.title)
  })
})

const onGenreChange = () => {
  if (currentGenre.value && !selectedGenres.value.includes(currentGenre.value)) {
    selectedGenres.value.push(currentGenre.value)
    loadByGenres()
  }
  currentGenre.value = ''
}

const onRatingFilterChange = () => {
  if (minRating.value) {
    loadByMinRating(parseInt(minRating.value))
  } else {
    loadAll()
  }
}

const removeGenre = (genre: string) => {
  const index = selectedGenres.value.indexOf(genre)
  if (index > -1) {
    selectedGenres.value.splice(index, 1)
    loadByGenres()
  }
}

const loadAll = async () => {
  resetFilterStates()
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
  resetFilterStates()
  isWatchedFilter.value = true
  const response = await axios.get(`${baseUrl}/watchlist/watched`)
  mediaList.value = response.data
}

const loadUnwatched = async () => {
  resetFilterStates()
  isUnwatchedFilter.value = true
  const response = await axios.get(`${baseUrl}/watchlist/unwatched`)
  mediaList.value = response.data
}

const loadRated = async () => {
  resetFilterStates()
  isRatingFilter.value = true
  const response = await axios.get(`${baseUrl}/watchlist/rated`)
  mediaList.value = response.data
}

const loadByMinRating = async (rating: number) => {
  resetFilterStates()
  isRatingFilter.value = true
  try {
    const allRated = await axios.get(`${baseUrl}/watchlist/rated`)
    mediaList.value = allRated.data.filter((media: Media) =>
      media.rating && media.rating >= rating
    ).sort((a: Media, b: Media) => (b.rating || 0) - (a.rating || 0))
  } catch (error) {
    console.error('Fehler beim Laden bewerteter Medien:', error)
  }
}

const loadByGenres = async () => {
  if (selectedGenres.value.length === 0 && !isMovieFilter.value && !isSeriesFilter.value) {
    if (isWatchedFilter.value) {
      await loadWatched()
      return
    } else if (isUnwatchedFilter.value) {
      await loadUnwatched()
      return
    } else {
      await loadAll()
      return
    }
  }

  const params = new URLSearchParams()
  selectedGenres.value.forEach(g => params.append('genres', g))

  if (isMovieFilter.value) {
    params.append('type', 'MOVIE')
  } else if (isSeriesFilter.value) {
    params.append('type', 'SERIES')
  }

  try {
    const response = await axios.get(`${baseUrl}/watchlist/filter?${params.toString()}`)
    let filteredData = response.data

    if (isWatchedFilter.value) {
      filteredData = filteredData.filter((media: Media) => media.watched)
    } else if (isUnwatchedFilter.value) {
      filteredData = filteredData.filter((media: Media) => !media.watched)
    }

    mediaList.value = filteredData
  } catch (error) {
    console.error('Fehler beim Filtern:', error)
  }
}

const deleteMedia = async (id: number) => {
  await axios.delete(`${baseUrl}/watchlist/${id}`)
  await refreshList()
}

const refreshList = async () => {
  if (isRatingFilter.value && minRating.value) {
    await loadByMinRating(parseInt(minRating.value))
  } else if (isRatingFilter.value) {
    await loadRated()
  } else if (selectedGenres.value.length > 0 || isMovieFilter.value || isSeriesFilter.value || isWatchedFilter.value || isUnwatchedFilter.value) {
    await loadByGenres()
  } else {
    await loadAll()
  }

  await loadLatestRatingDate()
}

const onMediaAdded = async () => {
  showAddModal.value = false
  await refreshList()
}

const resetFilters = async () => {
  selectedGenres.value = []
  currentGenre.value = ''
  minRating.value = ''
  resetFilterStates()
  await loadAll()
}

const resetFilterStates = () => {
  isMovieFilter.value = false
  isSeriesFilter.value = false
  isWatchedFilter.value = false
  isUnwatchedFilter.value = false
  isRatingFilter.value = false
}

onMounted(() => {
  loadAll()
  loadLatestRatingDate()
})
</script>

<style scoped>
.filter-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.filter-controls button,
.genre-dropdown,
.rating-dropdown {
  padding: 6px 10px;
  border: 1px solid #ccc;
  background-color: #f8f9fa;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  height: 30px;
  white-space: nowrap;
  flex-shrink: 0;
}

.filter-controls button:hover {
  background-color: #e9ecef;
}

.filter-controls button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.genre-dropdown,
.rating-dropdown {
  min-width: auto;
  width: auto;
  background-color: white;
  -webkit-appearance: none;
  appearance: none;
}

.genre-dropdown {
  width: 65px;
}

.rating-dropdown {
  width: 100px;
}

.genre-dropdown:focus,
.rating-dropdown:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.selected-genres-row {
  margin-bottom: 15px;
}

.selected-genres {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
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

.add-button {
  background-color: #28a745 !important;
  color: white !important;
  border-color: #28a745 !important;
}

.add-button:hover {
  background-color: #218838 !important;
  border-color: #1e7e34 !important;
}

.stats-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
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
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  border: 1px solid #dee2e6;
}

.modal-content h3 {
  color: #212529;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  text-align: center;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.close-btn {
  background: #6c757d;
  color: white;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1.5rem;
  width: 100%;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}

.close-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.latest-rating {
  color: #28a745;
  font-weight: 500;
}

.media-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
