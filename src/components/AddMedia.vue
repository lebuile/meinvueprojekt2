<template>
  <div class="add-media-form">
    <h3>Neue Filme/Serien hinzufügen</h3>

    <form @submit.prevent="addMedia">
      <div class="form-group">
        <label for="title" class="form-label">Titel:</label>
        <input
          type="text"
          id="title"
          v-model="newMedia.title"
          required
          placeholder="z.B. Inception"
          class="form-input"
        >
      </div>

      <div class="form-group">
        <label for="genre" class="form-label">Genre:</label>
        <select id="genre" v-model="newMedia.genre" required class="form-input">
          <option disabled value="">Genre wählen</option>
          <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="type" class="form-label">Typ:</label>
        <select id="type" v-model="newMedia.type" required class="form-input">
          <option value="MOVIE">Film</option>
          <option value="SERIES">Serie</option>
        </select>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="newMedia.watched" class="checkbox-input">
          <span class="checkbox-text">Bereits gesehen</span>
        </label>
      </div>

      <!-- Datum wann gesehen (nur wenn bereits gesehen) -->
      <div v-if="newMedia.watched" class="form-group">
        <label for="watchedDate" class="form-label">Wann gesehen:</label>
        <input
          type="date"
          id="watchedDate"
          v-model="watchedDate"
          class="form-input"
        >
        <small class="date-hint">Optional: Wann hast du es gesehen?</small>
      </div>

      <!-- Rating nur anzeigen wenn bereits gesehen -->
      <div v-if="newMedia.watched" class="form-group">
        <label class="form-label">Bewertung:</label>
        <StarRating v-model="newMedia.rating" />
      </div>

      <!-- Kommentar nur anzeigen wenn bereits gesehen -->
      <div v-if="newMedia.watched" class="form-group">
        <label for="comment" class="form-label">Kommentar:</label>
        <textarea
          id="comment"
          v-model="newMedia.comment"
          placeholder="Deine Meinung zu diesem Medium..."
          rows="3"
          class="form-input"
        ></textarea>
      </div>

      <button type="submit" class="submit-btn">Hinzufügen</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import StarRating from './StarRating.vue'
import type { Media } from '../types/media'

const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
const emit = defineEmits(['media-added'])

const genres = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi']

// Separates Ref für das Datum (nicht Teil des Media-Interfaces)
const watchedDate = ref('')

// Media-Objekt ohne watchedDate
const newMedia = ref<Partial<Media>>({
  title: '',
  genre: '',
  type: 'MOVIE',
  watched: false,
  rating: null,
  comment: ''
})

watch(() => newMedia.value.watched, (isWatched) => {
  if (!isWatched) {
    newMedia.value.rating = null
    newMedia.value.comment = ''
    watchedDate.value = ''
  }
})

const addMedia = async () => {
  try {
    const mediaToAdd = {
      ...newMedia.value,
      comment: newMedia.value.comment?.trim() || null,
      // Konvertiere watchedDate zu ratingDate falls gesetzt
      ratingDate: watchedDate.value ? new Date(watchedDate.value).toISOString() : null
    }

    await axios.post(`${baseUrl}/watchlist`, mediaToAdd)
    emit('media-added')

    // Reset form
    newMedia.value = {
      title: '',
      genre: '',
      type: 'MOVIE',
      watched: false,
      rating: null,
      comment: ''
    }
    watchedDate.value = ''

  } catch (error) {
    console.error('Fehler beim Hinzufügen:', error)
  }
}
</script>

<style scoped>
.add-media-form {
  background: white;
  padding: 0;
}

.add-media-form h3 {
  color: #212529;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 600;
  color: #212529 !important;
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  color: #212529 !important;
  background: #ffffff !important;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-input::placeholder {
  color: #6c757d !important;
  font-style: italic;
}

textarea.form-input {
  resize: vertical;
  min-height: 90px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #212529 !important;
  font-weight: 500;
}

.checkbox-input {
  width: auto !important;
  margin-right: 0.7rem;
  transform: scale(1.3);
  cursor: pointer;
}

.checkbox-text {
  color: #212529 !important;
  font-size: 1rem;
}

.date-hint {
  color: #6c757d;
  font-size: 0.8rem;
  margin-top: 0.3rem;
  display: block;
}

.submit-btn {
  background: #28a745;
  color: white;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  width: 100%;
  transition: all 0.15s ease-in-out;
  margin-top: 1rem;
}

.submit-btn:hover {
  background: #218838;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.submit-btn:active {
  transform: translateY(0);
}
</style>
