<template>
  <div v-if="show" class="trailer-modal-overlay" @click="closeModal">
    <div class="trailer-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ mediaTitle }} - Trailer</h3>
        <button @click="closeModal" class="close-btn">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Trailer wird geladen...</p>
        </div>

        <div v-else-if="trailerUrl" class="trailer-container">
          <iframe
            :src="getEmbedUrl(trailerUrl)"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="trailer-iframe"
          ></iframe>
        </div>

        <div v-else class="no-trailer">
          <div class="no-trailer-icon">🎬</div>
          <p>Kein Trailer verfügbar</p>
          <p class="suggestion">
            Du kannst bei
            <a :href="getYouTubeSearchUrl()" target="_blank" rel="noopener">
              YouTube suchen
            </a>
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn-primary">Schließen</button>
        <button v-if="trailerUrl" @click="openInNewTab" class="btn-secondary">
          Bei YouTube öffnen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  show: boolean
  mediaTitle: string
  trailerUrl: string | null
  loading: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const closeModal = () => {
  emit('close')
}

const getEmbedUrl = (url: string) => {
  if (!url) return ''

  // Konvertiere YouTube-URL zu Embed-URL
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (videoId && videoId[1]) {
    return `https://www.youtube.com/embed/${videoId[1]}?autoplay=1&rel=0`
  }
  return url
}

const getYouTubeSearchUrl = () => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(props.mediaTitle + ' trailer')}`
}

const openInNewTab = () => {
  if (props.trailerUrl) {
    window.open(props.trailerUrl, '_blank')
  }
}

// Schließe Modal bei ESC-Taste
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.show) {
    closeModal()
  }
}

watch(() => props.show, (isShown) => {
  if (isShown) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'auto'
  }
})
</script>

<style scoped>
.trailer-modal-overlay {
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

.trailer-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
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
  padding: 0;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #6c757d;
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

.trailer-container {
  width: 100%;
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
}

.trailer-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.no-trailer {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.no-trailer-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-trailer p {
  margin: 0.5rem 0;
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
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.btn-primary, .btn-secondary {
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .trailer-modal {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
  }
}
</style>
