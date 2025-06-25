<template>
  <div v-if="show" class="similar-modal-overlay" @click="closeModal">
    <div class="similar-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ getModalTitle() }}</h3>
        <button @click="closeModal" class="close-btn">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Empfehlungen werden geladen...</p>
        </div>

        <div v-else-if="similarMedia.length > 0" class="similar-grid">
          <div
            v-for="item in similarMedia"
            :key="item.tmdbId"
            class="similar-item"
          >
            <div class="poster-container">
              <img
                v-if="item.posterUrl"
                :src="item.posterUrl"
                :alt="item.title"
                class="poster"
                @error="handleImageError"
              >
              <div v-else class="no-poster">
                <span>🎬</span>
              </div>
            </div>

            <div class="item-info">
              <h4 class="item-title">{{ item.title }}</h4>

              <div class="item-rating" v-if="item.rating">
                <span class="rating-stars">⭐</span>
                <span>{{ item.rating.toFixed(1) }}</span>
              </div>

              <p class="item-overview" v-if="item.overview">
                {{ truncateText(item.overview, 120) }}
              </p>

              <button
                @click="addToWatchlist(item)"
                class="add-btn"
                :disabled="addingToWatchlist === item.tmdbId"
              >
                <span v-if="addingToWatchlist === item.tmdbId" class="btn-spinner"></span>
                {{ addingToWatchlist === item.tmdbId ? 'Hinzufügen...' : 'Zu Watchlist' }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="no-similar">
          <div class="no-similar-icon">🔍</div>
          <p>Keine ähnlichen Medien gefunden</p>
          <p class="suggestion">
            Versuche es später nochmal oder schaue bei
            <a :href="getTmdbSearchUrl()" target="_blank" rel="noopener">
              TMDB
            </a>
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn-primary">Schließen</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import { authService } from '../../authService'

interface SimilarMediaItem {
  tmdbId: number
  title: string
  overview: string
  posterUrl: string | null
  rating: number | null
  type: string
}

const props = defineProps<{
  show: boolean
  mediaId: number | null
  mediaTitle: string
  mediaType?: string // NEU: Für den Modal-Titel
}>()

const emit = defineEmits<{
  close: []
  mediaAdded: []
}>()

const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL

const loading = ref(false)
const similarMedia = ref<SimilarMediaItem[]>([])
const addingToWatchlist = ref<number | null>(null)

const closeModal = () => {
  emit('close')
}

// NEU: Dynamischer Modal-Titel basierend auf Medientyp
const getModalTitle = () => {
  const type = props.mediaType === 'MOVIE' ? 'Filme' : 'Serien'
  return `Ähnliche ${type} wie "${props.mediaTitle}"`
}

const loadSimilarMedia = async () => {
  if (!props.mediaId) return

  loading.value = true
  try {
    const response = await axios.get(`${baseUrl}/watchlist/${props.mediaId}/similar`)
    similarMedia.value = response.data.similarMedia || []
  } catch (error) {
    console.error('Fehler beim Laden der Empfehlungen:', error)
    similarMedia.value = []
  } finally {
    loading.value = false
  }
}

const addToWatchlist = async (item: SimilarMediaItem) => {
  addingToWatchlist.value = item.tmdbId

  try {
    const userId = authService.getUserId()
    if (!userId) {
      throw new Error('Nicht angemeldet')
    }

    // 1. Genre von TMDB über Backend abrufen
    const genre = await getGenreFromTmdb(item.tmdbId, item.type)

    const mediaToAdd = {
      title: item.title,
      genre: genre || 'Unbekannt', // Genre von TMDB oder Fallback
      type: item.type,
      watched: false,
      tmdbId: item.tmdbId,
      trailerUrl: null
    }

    await axios.post(`${baseUrl}/watchlist/${userId}/add`, mediaToAdd)
    emit('mediaAdded')

    // Erfolgs-Feedback
    console.log(`"${item.title}" wurde zur Watchlist hinzugefügt! Genre: ${genre}`)

  } catch (error) {
    console.error('Fehler beim Hinzufügen:', error)
    alert('Fehler beim Hinzufügen zur Watchlist')
  } finally {
    addingToWatchlist.value = null
  }
}

// NEU: Genre von TMDB über Backend abrufen
const getGenreFromTmdb = async (tmdbId: number, type: string): Promise<string | null> => {
  try {
    const response = await axios.get(`${baseUrl}/watchlist/tmdb/${tmdbId}/details?type=${type}`)

    if (response.data && response.data.genre) {
      return response.data.genre
    }
  } catch (error) {
    console.error('Fehler beim Abrufen des Genres:', error)
  }

  return null
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

const getTmdbSearchUrl = () => {
  return `https://www.themoviedb.org/search?query=${encodeURIComponent(props.mediaTitle)}`
}

// Lade ähnliche Medien wenn Modal geöffnet wird
watch(() => props.show, (isShown) => {
  if (isShown && props.mediaId) {
    loadSimilarMedia()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
})

// ESC-Taste zum Schließen
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.show) {
    closeModal()
  }
}

watch(() => props.show, (isShown) => {
  if (isShown) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
.similar-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.similar-modal {
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #212529;
  font-size: 1.3rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e9ecef;
  color: #212529;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #6c757d;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.similar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.similar-item {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.similar-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.poster-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-poster {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  font-size: 3rem;
  color: #6c757d;
}

.item-info {
  padding: 1rem;
}

.item-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  line-height: 1.3;
}

.item-rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.7rem;
  font-size: 0.9rem;
  color: #495057;
}

.rating-stars {
  font-size: 1rem;
}

.item-overview {
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.add-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  width: 100%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.add-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.add-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.no-similar {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.no-similar-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.suggestion {
  font-size: 0.9rem;
  margin-top: 1rem;
}

.suggestion a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.suggestion a:hover {
  text-decoration: underline;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #0056b3;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .similar-modal {
    width: 95%;
    max-height: 95vh;
  }

  .similar-grid {
    grid-template-columns: 1fr;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }
}
</style>
