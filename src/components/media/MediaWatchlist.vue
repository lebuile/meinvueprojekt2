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

      <!-- Search Bar rechts neben dem Add Button -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nach Titel suchen..."
            class="search-input"
            @input="handleSearch"
          >
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="clear-search-btn"
            title="Suche löschen"
          >
            ✕
          </button>
        </div>
      </div>
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

    <!-- Search Results Info -->
    <div v-if="searchQuery" class="search-results-info">
      <span class="search-term">Suche nach: "{{ searchQuery }}"</span>
      <span class="results-count">{{ filteredMediaList.length }} Ergebnis(se) gefunden</span>
    </div>

    <div class="stats-bar">
      <span>Gesamt: {{ filteredMediaList.length }}</span>
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

    <div v-if="filteredMediaList.length === 0" class="empty-state">
      <div class="empty-icon">
        {{ searchQuery ? '🔍' : '📝' }}
      </div>
      <p v-if="searchQuery">
        Keine Ergebnisse für "{{ searchQuery }}" gefunden.
      </p>
      <p v-else>
        Keine Medien gefunden. Füge dein erstes Medium hinzu!
      </p>
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="clear-search-suggestion"
      >
        Suche zurücksetzen
      </button>
    </div>

    <ul v-else class="media-list">
      <MediaItem
        v-for="media in sortedAndFilteredMediaList"
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
import { authService } from '../../authService'
import MediaItem from './MediaItem.vue'
import AddMedia from './AddMedia.vue'
import type { Media } from '../../types/media.ts'

// Bestehende refs
const selectedGenres = ref<string[]>([])
const currentGenre = ref<string>('')
const minRating = ref<string>('')
const genres = ['Action', 'Animation', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi']

const isMovieFilter = ref(false)
const isSeriesFilter = ref(false)
const isWatchedFilter = ref(false)
const isUnwatchedFilter = ref(false)
const isRatingFilter = ref(false)

const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
const mediaList = ref<Media[]>([])
const showAddModal = ref(false)
const latestRatingDate = ref<string | null>(null)

// NEU: Search functionality
const searchQuery = ref<string>('')

const getUserId = () => {
  const userId = authService.getUserId()
  if (!userId) {
    throw new Error('Nicht angemeldet')
  }
  return userId
}

// NEU: Filtered media list based on search (nur Titel)
const filteredMediaList = computed(() => {
  if (!searchQuery.value.trim()) {
    return mediaList.value
  }

  const query = searchQuery.value.toLowerCase().trim()

  return mediaList.value.filter(media => {
    return media.title.toLowerCase().includes(query)
  })
})

const hasActiveFilters = computed(() => {
  return selectedGenres.value.length > 0 ||
    isMovieFilter.value ||
    isSeriesFilter.value ||
    isWatchedFilter.value ||
    isUnwatchedFilter.value ||
    minRating.value !== '' ||
    isRatingFilter.value ||
    searchQuery.value.trim() !== ''
})

const movieCount = computed(() => {
  return filteredMediaList.value.filter(media => media.type === 'MOVIE').length
})

const seriesCount = computed(() => {
  return filteredMediaList.value.filter(media => media.type === 'SERIES').length
})

const ratedCount = computed(() => {
  return filteredMediaList.value.filter(media => media.rating && media.rating > 0).length
})

const averageRating = computed(() => {
  const ratedMedias = filteredMediaList.value.filter(media => media.rating && media.rating > 0)
  if (ratedMedias.length === 0) return 0
  const sum = ratedMedias.reduce((acc, media) => acc + (media.rating || 0), 0)
  return sum / ratedMedias.length
})

const sortedAndFilteredMediaList = computed(() => {
  return [...filteredMediaList.value].sort((a, b) => {
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

// NEU: Search functions
const handleSearch = () => {
  // Reaktive Suche - filtert automatisch durch computed property
}

const clearSearch = () => {
  searchQuery.value = ''
}

const loadLatestRatingDate = async () => {
  try {
    const userId = getUserId()
    const response = await axios.get(`${baseUrl}/api/watchlist/${userId}/latest-rating-date`)
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

// Bestehende Filter-Funktionen
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
  try {
    const userId = getUserId()
    const response = await axios.get(`${baseUrl}/api/watchlist/${userId}/all`)
    mediaList.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden:', error)
  }
}

const loadMovies = async () => {
  isMovieFilter.value = true
  isSeriesFilter.value = false
  try {
    const userId = getUserId()
    const response = await axios.get(`${baseUrl}/api/watchlist/${userId}/movies`)
    mediaList.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden der Filme:', error)
  }
}

const loadSeries = async () => {
  isSeriesFilter.value = true
  isMovieFilter.value = false
  try {
    const userId = getUserId()
    const response = await axios.get(`${baseUrl}/api/watchlist/${userId}/series`)
    mediaList.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden der Serien:', error)
  }
}

const loadWatched = async () => {
  resetFilterStates()
  isWatchedFilter.value = true
  try {
    const userId = getUserId()
    const response = await axios.get(`${baseUrl}/api/watchlist/${userId}/watched`)
    mediaList.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden der gesehenen Medien:', error)
  }
}

const loadUnwatched = async () => {
  resetFilterStates()
  isUnwatchedFilter.value = true
  try {
    const userId = getUserId()
    const response = await axios.get(`${baseUrl}/api/watchlist/${userId}/unwatched`)
    mediaList.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden der ungesehenen Medien:', error)
  }
}

const loadRated = async () => {
  resetFilterStates()
  isRatingFilter.value = true
  try {
    const userId = getUserId()
    const response = await axios.get(`${baseUrl}/api/watchlist/${userId}/rated`)
    mediaList.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden der bewerteten Medien:', error)
  }
}

const loadByMinRating = async (rating: number) => {
  resetFilterStates()
  isRatingFilter.value = true
  try {
    const userId = getUserId()
    const response = await axios.get(`${baseUrl}/api/watchlist/${userId}/rating-min/${rating}`)
    mediaList.value = response.data
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

  try {
    const userId = getUserId()
    const params = new URLSearchParams()
    selectedGenres.value.forEach(g => params.append('genres', g))

    const response = await axios.get(`${baseUrl}/api/watchlist/${userId}/genres?${params.toString()}`)
    let filteredData = response.data

    if (isMovieFilter.value) {
      filteredData = filteredData.filter((media: Media) => media.type === 'MOVIE')
    } else if (isSeriesFilter.value) {
      filteredData = filteredData.filter((media: Media) => media.type === 'SERIES')
    }

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
  try {
    const userId = getUserId()
    await axios.delete(`${baseUrl}/api/watchlist/${userId}/delete/${id}`)
    await refreshList()
  } catch (error) {
    console.error('Fehler beim Löschen:', error)
  }
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
  searchQuery.value = '' // NEU: Such-Query zurücksetzen
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
  gap: 6px; /* Kleinerer Abstand */
  margin-bottom: 20px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.filter-controls button,
.genre-dropdown,
.rating-dropdown {
  padding: 6px 8px; /* Kompakteres Padding */
  border: 1px solid #ccc;
  background-color: #f8f9fa;
  cursor: pointer;
  border-radius: 4px;
  font-size: 11px; /* Kleinere Schrift */
  height: 30px;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: auto; /* Erlaubt kleinere Breiten */
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
  width: auto;
  min-width: 60px; /* Minimale Breite */
  background-color: white;
  -webkit-appearance: none;
  appearance: none;
}

.genre-dropdown {
  width: 55px; /* Noch kompakter */
}

.rating-dropdown {
  width: 75px; /* Kompakter */
}

.genre-dropdown:focus,
.rating-dropdown:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.reset-button {
  background-color: #dc3545 !important;
  color: white !important;
  border-color: #dc3545 !important;
  padding: 6px 8px !important; /* Kompakter */
  font-size: 10px !important; /* Kleinere Schrift */
}

.reset-button:hover {
  background-color: #c82333 !important;
  border-color: #bd2130 !important;
}

.add-button {
  background-color: #28a745 !important;
  color: white !important;
  border-color: #28a745 !important;
  padding: 6px 8px !important; /* Kompakter */
  font-size: 10px !important; /* Kleinere Schrift */
}

.add-button:hover {
  background-color: #218838 !important;
  border-color: #1e7e34 !important;
}

/* NEU: Search Container neben Add Button */
.search-container {
  position: relative;
  margin-left: 6px; /* Kleinerer Abstand */
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 140px; /* Noch kompakter */
}

.search-icon {
  position: absolute;
  left: 6px; /* Kleinerer Abstand */
  font-size: 12px; /* Kleineres Icon */
  color: #6c757d;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 6px 24px 6px 20px; /* Kompakteres Padding */
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 11px; /* Kleinere Schrift */
  background: white;
  transition: all 0.2s ease;
  height: 30px;
  box-sizing: border-box;
}

.search-input:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
  border-color: #007bff;
}

.search-input::placeholder {
  color: #6c757d;
  font-style: italic;
}

.clear-search-btn {
  position: absolute;
  right: 4px; /* Kleinerer Abstand */
  background: none;
  border: none;
  font-size: 10px; /* Kleineres X */
  color: #6c757d;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 1;
  width: 14px; /* Kleinerer Button */
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search-btn:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.search-results-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #e8f4fd;
  border-radius: 6px;
  margin-bottom: 15px;
  border-left: 4px solid #007bff;
}

.search-term {
  font-weight: 500;
  color: #0056b3;
}

.results-count {
  font-size: 12px;
  color: #6c757d;
  background: white;
  padding: 2px 8px;
  border-radius: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.clear-search-suggestion {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 12px;
  transition: all 0.2s ease;
}

.clear-search-suggestion:hover {
  background: #0056b3;
  transform: translateY(-1px);
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

.stats-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  flex-wrap: wrap;
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

.latest-rating {
  color: #28a745;
  font-weight: 500;
}

.media-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .filter-controls {
    flex-wrap: wrap;
  }

  .search-container {
    order: 1;
    width: 100%;
    margin: 8px 0;
    margin-left: 0;
    margin-right: 0;
  }

  .search-input-wrapper {
    width: 100%;
  }

  .search-input {
    font-size: 16px; /* Verhindert Zoom auf iOS */
  }

  .add-button {
    order: 2;
    width: 100%;
  }

  .search-results-info {
    flex-direction: column;
    gap: 5px;
    text-align: center;
  }

  .stats-bar {
    gap: 10px;
    font-size: 12px;
  }
}
</style>
