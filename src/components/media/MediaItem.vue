<template>
  <li class="media-item">
    <div class="media-info">
      <div class="media-main">
        <span class="title">{{ media.title }}</span>
        <span class="genre">{{ media.genre }}</span>
        <span class="type">{{ media.type === 'MOVIE' ? 'Film' : 'Serie' }}</span>
        <span class="status">{{ media.watched ? 'Gesehen' : 'Nicht gesehen' }}</span>

        <!-- NEU: Trailer-Button für ungesehene Medien -->
        <button
          v-if="!media.watched"
          @click="openTrailer"
          class="trailer-btn"
          :disabled="loadingTrailer"
        >
          <span v-if="loadingTrailer" class="btn-spinner"></span>
          🎬 Trailer
        </button>

        <!-- NEU: Similar-Button -->
        <button
          @click="openSimilarMedia"
          class="similar-btn"
          title="Empfehlungen basierend auf diesem Medium"
        >
          💡 Empfehlungen
        </button>
      </div>

      <div class="media-rating">
        <StarRating
          v-model="localRating"
          :readonly="!media.watched"
          @update:modelValue="updateRating"
        />
        <small v-if="!media.watched" class="rating-hint">
          Bewerten nach dem Ansehen
        </small>
      </div>

      <div v-if="media.watched" class="media-comment">
        <textarea
          v-model="localComment"
          placeholder="Kommentar hinzufügen..."
          class="comment-input"
          @blur="updateComment"
          @keyup.enter.ctrl="updateComment"
        ></textarea>
      </div>

      <div v-if="media.comment && media.comment.trim()" class="existing-comment">
        <strong>Kommentar:</strong> {{ media.comment }}
        <div v-if="media.ratingDate" class="rating-date">
          Bewertet: {{ formatDate(media.ratingDate) }}
        </div>
      </div>
    </div>

    <div class="media-actions">
      <button @click="toggleEdit" class="edit-btn">
        {{ isEditing ? 'Abbrechen' : 'Bearbeiten' }}
      </button>
      <button @click="$emit('delete', media.id)" class="delete-btn">
        Löschen
      </button>
    </div>

    <!-- NEU: Trailer Modal -->
    <TrailerModal
      :show="showTrailerModal"
      :media-title="media.title"
      :trailer-url="currentTrailerUrl"
      :loading="loadingTrailer"
      @close="closeTrailerModal"
    />

    <!-- NEU: Similar Media Modal -->
    <SimilarMedia
      :show="showSimilarModal"
      :media-id="media.id"
      :media-title="media.title"
      :media-type="media.type"
      @close="closeSimilarModal"
      @media-added="$emit('updated')"
    />

    <!-- Edit Modal -->
    <div v-if="isEditing" class="edit-modal">
      <div class="edit-form">
        <h3>{{ media.title }} bearbeiten</h3>

        <div class="form-group">
          <label>Titel:</label>
          <input v-model="editForm.title" type="text">
        </div>

        <div class="form-group">
          <label>Genre:</label>
          <select v-model="editForm.genre">
            <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Typ:</label>
          <select v-model="editForm.type">
            <option value="MOVIE">Film</option>
            <option value="SERIES">Serie</option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" v-model="editForm.watched">
            Gesehen
          </label>
        </div>

        <div v-if="editForm.watched" class="form-group">
          <label>Bewertung:</label>
          <StarRating v-model="editForm.rating" />
        </div>

        <div v-if="editForm.watched" class="form-group">
          <label>Kommentar:</label>
          <textarea v-model="editForm.comment" rows="3"></textarea>
        </div>

        <div class="form-actions">
          <button @click="saveEdit" class="save-btn">Speichern</button>
          <button @click="toggleEdit" class="cancel-btn">Abbrechen</button>
        </div>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import axios from 'axios'
import StarRating from './StarRating.vue'
import TrailerModal from './TrailerModal.vue'
import SimilarMedia from './SimilarMedia.vue' // NEU: Import der SimilarMedia-Komponente
import type { Media } from '../../types/media.ts'

const props = defineProps<{
  media: Media
}>()

const emit = defineEmits(['delete', 'updated'])

const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
const genres = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi']

const formatDate = (dateString: string | null) => {
  if (!dateString) return null

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'heute'
  } else if (diffDays === 1) {
    return 'gestern'
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

const isEditing = ref(false)
const localRating = ref(props.media.rating)
const localComment = ref(props.media.comment || '')

// Trailer-bezogene Refs
const showTrailerModal = ref(false)
const loadingTrailer = ref(false)
const currentTrailerUrl = ref<string | null>(null)

// NEU: Similar Media Refs
const showSimilarModal = ref(false)

const editForm = reactive({
  title: props.media.title,
  genre: props.media.genre,
  type: props.media.type,
  watched: props.media.watched,
  rating: props.media.rating,
  comment: props.media.comment || ''
})

watch(() => props.media, (newMedia) => {
  localRating.value = newMedia.rating
  localComment.value = newMedia.comment || ''
}, { deep: true })

const updateRating = async (newRating: number | null) => {
  try {
    await axios.patch(`${baseUrl}/watchlist/${props.media.id}/rating`, {
      rating: newRating,
      comment: localComment.value
    })
    emit('updated')
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Bewertung:', error)
    localRating.value = props.media.rating
  }
}

const updateComment = async () => {
  if (localComment.value === props.media.comment) return

  try {
    await axios.patch(`${baseUrl}/watchlist/${props.media.id}/rating`, {
      rating: localRating.value,
      comment: localComment.value
    })
    emit('updated')
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Kommentars:', error)
    localComment.value = props.media.comment || ''
  }
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (isEditing.value) {
    Object.assign(editForm, {
      title: props.media.title,
      genre: props.media.genre,
      type: props.media.type,
      watched: props.media.watched,
      rating: props.media.rating,
      comment: props.media.comment || ''
    })
  }
}

const saveEdit = async () => {
  try {
    await axios.put(`${baseUrl}/watchlist/${props.media.id}`, editForm)
    isEditing.value = false
    emit('updated')
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
  }
}

// Trailer-bezogene Methoden
const openTrailer = async () => {
  loadingTrailer.value = true
  showTrailerModal.value = true

  try {
    const response = await axios.get(`${baseUrl}/watchlist/${props.media.id}/trailer`)
    currentTrailerUrl.value = response.data.trailerUrl
  } catch (error) {
    console.error('Fehler beim Laden des Trailers:', error)
    currentTrailerUrl.value = null
  } finally {
    loadingTrailer.value = false
  }
}

const closeTrailerModal = () => {
  showTrailerModal.value = false
  currentTrailerUrl.value = null
}

// NEU: Similar Media Methoden
const openSimilarMedia = () => {
  showSimilarModal.value = true
}

const closeSimilarModal = () => {
  showSimilarModal.value = false
}
</script>

<style scoped>
.media-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.media-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.media-main {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.title {
  font-weight: bold;
  font-size: 1.2rem;
  color: #212529;
  min-width: 120px;
}

.genre, .type, .status {
  background: #e9ecef;
  color: #495057;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #dee2e6;
}

/* Trailer-Button Styles */
.trailer-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.trailer-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ee5a24, #ff6b6b);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.trailer-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* NEU: Similar-Button Styles */
.similar-btn {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
}

.similar-btn:hover {
  background: linear-gradient(135deg, #138496, #17a2b8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.4);
}

.btn-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.media-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.rating-hint {
  color: #6c757d;
  font-style: italic;
  font-size: 0.85rem;
}

.comment-input {
  width: 100%;
  min-height: 70px;
  padding: 0.6rem;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.9rem;
  color: #212529;
  background: #fff;
  transition: border-color 0.15s ease-in-out;
}

.comment-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.comment-input::placeholder {
  color: #6c757d;
}

.existing-comment {
  background: #f8f9fa;
  color: #212529;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 4px solid #007bff;
  margin-top: 0.5rem;
}

.existing-comment strong {
  color: #495057;
}

.media-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 1rem;
}

.edit-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
  min-width: 100px;
}

.edit-btn {
  background: #007bff;
  color: white;
}

.edit-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edit-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.edit-form h3 {
  color: #212529;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.6rem;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #212529;
  background: #fff;
  transition: border-color 0.15s ease-in-out;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.save-btn {
  background: #28a745;
  color: white;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}

.save-btn:hover {
  background: #218838;
  transform: translateY(-1px);
}

.cancel-btn {
  background: #6c757d;
  color: white;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
}

.cancel-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.rating-date {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.3rem;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .media-item {
    flex-direction: column;
    gap: 1rem;
  }

  .media-actions {
    flex-direction: row;
    margin-left: 0;
  }

  .media-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
