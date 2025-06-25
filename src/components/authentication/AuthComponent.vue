<template>
  <div class="auth-overlay">
    <div class="auth-container">
      <div class="auth-card">
        <!-- Login Form -->
        <div v-if="!isRegisterMode" class="auth-form">
          <div class="auth-header">
            <h2>Anmelden</h2>
            <p>Willkommen zurück bei deiner Watchlist!</p>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <label for="loginUsername">Benutzername:</label>
              <input
                type="text"
                id="loginUsername"
                v-model="loginForm.username"
                required
                :disabled="loading"
                placeholder="Dein Benutzername"
              >
            </div>

            <div class="input-group">
              <label for="loginPassword">Passwort:</label>
              <input
                type="password"
                id="loginPassword"
                v-model="loginForm.password"
                required
                :disabled="loading"
                placeholder="Dein Passwort"
              >
            </div>

            <button type="submit" class="auth-btn" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Anmeldung...' : 'Anmelden' }}
            </button>
          </form>

          <div class="auth-switch">
            Noch kein Konto?
            <a href="#" @click.prevent="toggleMode">Jetzt registrieren</a>
          </div>
        </div>

        <!-- Register Form -->
        <div v-else class="auth-form">
          <div class="auth-header">
            <h2>Registrieren</h2>
            <p>Erstelle dein Konto für deine persönliche Watchlist!</p>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleRegister">
            <div class="input-group">
              <label for="registerUsername">Benutzername:</label>
              <input
                type="text"
                id="registerUsername"
                v-model="registerForm.username"
                required
                :disabled="loading"
                placeholder="Wähle einen Benutzername"
                minlength="3"
              >
            </div>

            <div class="input-group">
              <label for="registerPassword">Passwort:</label>
              <input
                type="password"
                id="registerPassword"
                v-model="registerForm.password"
                required
                :disabled="loading"
                placeholder="Wähle ein sicheres Passwort"
                minlength="6"
              >
            </div>

            <button type="submit" class="auth-btn" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? 'Registrierung...' : 'Registrieren' }}
            </button>
          </form>

          <div class="auth-switch">
            Bereits ein Konto?
            <a href="#" @click.prevent="toggleMode">Jetzt anmelden</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { authService } from '../../authService'

const emit = defineEmits<{
  loginSuccess: []
}>()

const isRegisterMode = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: ''
})

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value
  errorMessage.value = ''

  loginForm.username = ''
  loginForm.password = ''
  registerForm.username = ''
  registerForm.password = ''
}

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    await authService.login(loginForm)
    emit('loginSuccess')
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Login fehlgeschlagen'
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    await authService.register(registerForm)
    emit('loginSuccess')
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Registrierung fehlgeschlagen'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.auth-header p {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  border: 1px solid #fcc;
  font-size: 0.9rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.input-group input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.auth-btn {
  width: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.auth-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-switch {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.auth-switch a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.auth-switch a:hover {
  text-decoration: underline;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .auth-container {
    padding: 1rem;
  }

  .auth-card {
    padding: 2rem 1.5rem;
  }

  .auth-header h2 {
    font-size: 1.8rem;
  }
}
</style>
