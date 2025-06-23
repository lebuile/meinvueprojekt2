<template>
  <form @submit.prevent="addMedia">
    <div>
      <label for="title">Titel:</label>
      <input type="text" id="title" v-model="newMedia.title" required>
    </div>
    <div>
      <label for="genre">Genre:</label>
      <select id="genre" v-model="newMedia.genre" required>
        <option disabled value="">Genre wählen</option>
        <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
      </select>
    </div>
    <div>
      <label for="type">Typ:</label>
      <select id="type" v-model="newMedia.type" required>
        <option value="MOVIE">Film</option>
        <option value="SERIES">Serie</option>
      </select>
    </div>
    <div>
      <label>
        <input type="checkbox" v-model="newMedia.watched">
        Bereits gesehen
      </label>
    </div>
    <button type="submit">Hinzufügen</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import type { Media } from '../types/media'

const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL
const emit = defineEmits(['media-added'])

const genres = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi']

const newMedia = ref<Partial<Media>>({
  title: '',
  genre: '',
  type: 'MOVIE',
  watched: false
})

const addMedia = async () => {
  try {
    await axios.post(`${baseUrl}/watchlist`, newMedia.value)
    emit('media-added')
    // Form zurücksetzen
    newMedia.value = {
      title: '',
      genre: '',
      type: 'MOVIE',
      watched: false
    }
  } catch (error) {
    console.error('Fehler beim Hinzufügen:', error)
  }
}
</script>
