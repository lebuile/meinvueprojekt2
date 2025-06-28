<template>
  <div v-if="show" class="where-to-watch-overlay" @click="closeModal">
    <div class="where-to-watch-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ mediaTitle }} - Wo schauen?</h3>
        <button @click="closeModal" class="close-btn">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Streaming-Informationen werden geladen...</p>
        </div>

        <div v-else-if="whereToWatch" class="streaming-content">
          <!-- Region Info -->
          <div class="region-info">
            <span class="region-badge">{{ getRegionName(whereToWatch.region) }}</span>
            <p class="region-note">Verfügbarkeit kann sich ändern</p>
          </div>

          <!-- Streaming mit Abo -->
          <div v-if="whereToWatch.flatrate && whereToWatch.flatrate.length > 0" class="streaming-section">
            <h4 class="section-title">
              <span class="icon">📺</span>
              Streaming (mit Abo)
            </h4>
            <div class="providers-grid">
              <div
                v-for="provider in whereToWatch.flatrate"
                :key="provider.providerId"
                class="provider-item"
              >
                <img
                  v-if="provider.logoUrl"
                  :src="provider.logoUrl"
                  :alt="provider.providerName"
                  class="provider-logo"
                  @error="handleImageError"
                >
                <div v-else class="provider-fallback">
                  {{ provider.providerName.charAt(0) }}
                </div>
                <span class="provider-name">{{ provider.providerName }}</span>
              </div>
            </div>
          </div>

          <!-- Ausleihen -->
          <div v-if="whereToWatch.rent && whereToWatch.rent.length > 0" class="streaming-section">
            <h4 class="section-title">
              <span class="icon">💰</span>
              Ausleihen
            </h4>
            <div class="providers-grid">
              <div
                v-for="provider in whereToWatch.rent"
                :key="provider.providerId"
                class="provider-item"
              >
                <img
                  v-if="provider.logoUrl"
                  :src="provider.logoUrl"
                  :alt="provider.providerName"
                  class="provider-logo"
                  @error="handleImageError"
                >
                <div v-else class="provider-fallback">
                  {{ provider.providerName.charAt(0) }}
                </div>
                <span class="provider-name">{{ provider.providerName }}</span>
              </div>
            </div>
          </div>

          <!-- Kaufen -->
          <div v-if="whereToWatch.buy && whereToWatch.buy.length > 0" class="streaming-section">
            <h4 class="section-title">
              <span class="icon">🛒</span>
              Kaufen
            </h4>
            <div class="providers-grid">
              <div
                v-for="provider in whereToWatch.buy"
                :key="provider.providerId"
                class="provider-item"
              >
                <img
                  v-if="provider.logoUrl"
                  :src="provider.logoUrl"
                  :alt="provider.providerName"
                  class="provider-logo"
                  @error="handleImageError"
                >
                <div v-else class="provider-fallback">
                  {{ provider.providerName.charAt(0) }}
                </div>
                <span class="provider-name">{{ provider.providerName }}</span>
              </div>
            </div>
          </div>

          <!-- Keine Optionen verfügbar -->
          <div v-if="!hasAnyProviders" class="no-providers">
            <div class="no-providers-icon">🔍</div>
            <p>Derzeit nicht auf Streaming-Plattformen verfügbar</p>
            <p class="suggestion">
              Versuche es bei
              <a :href="getGoogleSearchUrl()" target="_blank" rel="noopener">
                Google
              </a>
              oder schau später nochmal vorbei
            </p>
          </div>

          <!-- JustWatch Link entfernt - nicht mehr benötigt -->
        </div>

        <div v-else class="no-data">
          <div class="no-data-icon">❓</div>
          <p>Keine Streaming-Informationen verfügbar</p>
          <p class="suggestion">
            Versuche es direkt bei
            <a :href="getGoogleSearchUrl()" target="_blank" rel="noopener">
              Google
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
import { ref, computed, watch } from 'vue'
import axios from 'axios'

interface StreamingProvider {
  providerId: number
  providerName: string
  logoUrl: string | null
}

interface WhereToWatchResult {
  flatrate: StreamingProvider[]
  rent: StreamingProvider[]
  buy: StreamingProvider[]
  link: string | null
  region: string
}

const props = defineProps<{
  show: boolean
  mediaId: number | null
  mediaTitle: string
}>()

const emit = defineEmits<{
  close: []
}>()

const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL

const loading = ref(false)
const whereToWatch = ref<WhereToWatchResult | null>(null)

const hasAnyProviders = computed(() => {
  if (!whereToWatch.value) return false

  return (
    (whereToWatch.value.flatrate && whereToWatch.value.flatrate.length > 0) ||
    (whereToWatch.value.rent && whereToWatch.value.rent.length > 0) ||
    (whereToWatch.value.buy && whereToWatch.value.buy.length > 0)
  )
})

const closeModal = () => {
  emit('close')
}

const getRegionName = (region: string) => {
  const regionNames: Record<string, string> = {
    'DE': 'Deutschland',
    'AT': 'Österreich',
    'CH': 'Schweiz',
    'US': 'USA',
    'GB': 'Großbritannien'
  }
  return regionNames[region] || region
}

const loadWhereToWatch = async () => {
  if (!props.mediaId) return

  loading.value = true
  try {
    const response = await axios.get(`${baseUrl}/api/watchlist/${props.mediaId}/where-to-watch`)
    whereToWatch.value = response.data
    console.log('Where to Watch Daten:', response.data)
  } catch (error) {
    console.error('Fehler beim Laden der Streaming-Informationen:', error)
    whereToWatch.value = null
  } finally {
    loading.value = false
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  const fallback = target.nextElementSibling as HTMLElement
  if (fallback && fallback.classList.contains('provider-fallback')) {
    target.style.display = 'none'
    fallback.style.display = 'flex'
  }
}

const getGoogleSearchUrl = () => {
  return `https://www.google.com/search?q=${encodeURIComponent(props.mediaTitle + ' stream online schauen')}`
}

// Lade Streaming-Informationen wenn Modal geöffnet wird
watch(() => props.show, (isShown) => {
  if (isShown && props.mediaId) {
    loadWhereToWatch()
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
.where-to-watch-overlay {
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

.where-to-watch-modal {
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 800px;
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

.streaming-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.region-info {
  text-align: center;
  padding: 1rem;
  background: #e8f4fd;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.region-badge {
  background: #007bff;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.region-note {
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  color: #6c757d;
}

.streaming-section {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #212529;
  font-size: 1.1rem;
  font-weight: 600;
}

.icon {
  font-size: 1.2rem;
}

.providers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.provider-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid transparent;
}

.provider-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.provider-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.provider-fallback {
  width: 60px;
  height: 60px;
  background: #007bff;
  color: white;
  border-radius: 8px;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.provider-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #212529;
  text-align: center;
  line-height: 1.2;
}

.no-providers,
.no-data {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.no-providers-icon,
.no-data-icon {
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
  .where-to-watch-modal {
    width: 95%;
    max-height: 95vh;
  }

  .providers-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.8rem;
  }

  .provider-item {
    padding: 0.8rem;
  }

  .provider-logo,
  .provider-fallback {
    width: 50px;
    height: 50px;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }
}
</style>
