<template>
  <div class="app">
    <!-- Zeige Login/Register mit Dashboard-Design -->
    <div v-if="!isLoggedIn" class="login-page">
      <div class="hero-section">
        <div class="logo-container">
          <img src="/logo.png" alt="Logo" class="main-logo" />
          <h1 class="app-title">Meine Watchlist</h1>
        </div>

        <!-- Auth Component wird hier eingebettet -->
        <div class="auth-container">
          <AuthComponent @login-success="handleLoginSuccess" />
        </div>
      </div>
    </div>

    <!-- Zeige Watchlist direkt nach Login -->
    <div v-else class="watchlist-view">
      <div class="header">
        <div class="header-left">
          <div class="logo-mini">
            <img src="/logo.png" alt="Logo" class="mini-logo" />
            <span class="app-name">Meine Watchlist</span>
          </div>
        </div>

        <h1 class="page-title">📺 Meine Watchlist</h1>

        <div class="user-section">
          <span class="username">{{ currentUser?.username }}</span>
          <button @click="handleLogout" class="logout-btn">
            Abmelden
          </button>
        </div>
      </div>

      <MediaWatchlist />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { authService } from './authService'
import AuthComponent from './components/authentication/AuthComponent.vue'
import MediaWatchlist from './components/media/MediaWatchlist.vue'

const isLoggedIn = ref(false)

const currentUser = computed(() => authService.getCurrentUser())

onMounted(() => {
  // Prüfe Login-Status beim Start
  isLoggedIn.value = authService.isLoggedIn()
})

const handleLoginSuccess = () => {
  isLoggedIn.value = true
  // Gehe direkt zur Watchlist (kein Dashboard)
}

const handleLogout = () => {
  authService.logout()
  isLoggedIn.value = false
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

/* Login Page - Dashboard Design */
.login-page {
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
  padding: 3rem 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  margin: 2rem;
  width: 100%;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.main-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  background: transparent;
  border-radius: 50%;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-container {
  width: 100%;
}

/* Watchlist View */
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
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #2d3748;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-mini {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mini-logo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: contain;
}

.app-name {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 1rem;
}

.page-title {
  margin: 0;
  color: #f7fafc;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
  flex: 1;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  color: #e2e8f0;
  font-weight: 500;
  font-size: 1rem;
}

.logout-btn {
  background: linear-gradient(45deg, #e53e3e, #c53030);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: linear-gradient(45deg, #c53030, #9c2626);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .hero-section {
    padding: 2.5rem 2rem;
    margin: 1rem;
    max-width: none;
  }

  .main-logo {
    width: 60px;
    height: 60px;
  }

  .app-title {
    font-size: 1.6rem;
  }

  .header {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0.5rem;
  }

  .header-left {
    order: 1;
  }

  .page-title {
    font-size: 1.4rem;
    order: 2;
  }

  .user-section {
    flex-direction: row;
    gap: 0.5rem;
    order: 3;
  }

  .app-name {
    display: none;
  }
}

.login-page,
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
