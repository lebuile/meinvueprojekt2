<template>
  <div class="app">
    <div v-if="!showWatchlist" class="landing-page">
      <div class="hero-section">
        <div class="logo-container">
          <img src="/logo.png" alt="Logo" class="main-logo" />
          <h1 class="app-title">Meine Watchlist</h1>
        </div>

        <button @click="openWatchlist" class="primary-btn">
          🎬 Meine Watchlist öffnen
        </button>
      </div>
    </div>

    <div v-else class="watchlist-view">
      <div class="header">
        <button @click="goBack" class="back-btn">
          ← Zurück
        </button>
        <h1 class="page-title">📺 Meine Watchlist</h1>
      </div>

      <MediaWatchlist />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MediaWatchlist from './components/media/MediaWatchlist.vue'

const showWatchlist = ref(false)

const openWatchlist = () => {
  showWatchlist.value = true
}

const goBack = () => {
  showWatchlist.value = false
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

#app {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
}
</style>

<style scoped>
.app {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #1a202c;
  overflow: hidden;
}

.landing-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.hero-section {
  text-align: center;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  padding: 4rem 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  margin: 2rem;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.main-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  background: transparent;
  border-radius: 50%;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.main-logo:hover {
  transform: scale(1.05);
}

.app-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.app-subtitle {
  font-size: 1.3rem;
  color: #4a5568;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.primary-btn {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  border: none;
  padding: 1.2rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(66, 153, 225, 0.3);
  transform: translateY(0);
}

.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(66, 153, 225, 0.4);
  background: linear-gradient(135deg, #3182ce, #2c5aa0);
}

.primary-btn:active {
  transform: translateY(-1px);
}

.watchlist-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #1a202c;
  padding: 1rem;
  overflow-y: auto;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #2d3748;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.back-btn {
  background: #4a5568;
  color: #e2e8f0;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  position: absolute;
  left: 1rem;
}

.back-btn:hover {
  background: #718096;
  transform: translateX(-2px);
}

.page-title {
  margin: 0;
  color: #f7fafc;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 2rem;
    margin: 1rem;
    max-width: none;
  }

  .main-logo {
    width: 90px;
    height: 90px;
  }

  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 1.1rem;
  }

  .primary-btn {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }
}

.landing-page,
.watchlist-view {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
