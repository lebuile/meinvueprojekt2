<template>
  <div class="auth-embedded">
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
.auth-embedded {
  width: 100%;
}

.auth-form {
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: #2d3748;
}

.auth-header p {
  margin: 0;
  color: #4a5568;
  font-size: 0.9rem;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1.2rem;
  border: 1px solid #fcc;
  font-size: 0.85rem;
  text-align: center;
}

.input-group {
  margin-bottom: 1.2rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.input-group input {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  color: #2d3748;
  background: #fff;
}

.input-group input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.input-group input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
  opacity: 0.7;
}

.input-group input::placeholder {
  color: #a0aec0;
}

.auth-btn {
  width: 100%;
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.auth-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(66, 153, 225, 0.3);
  background: linear-gradient(135deg, #3182ce, #2c5aa0);
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 14px;
  height: 14px;
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
  color: #4a5568;
  font-size: 0.85rem;
}

.auth-switch a {
  color: #4299e1;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.3rem;
}

.auth-switch a:hover {
  text-decoration: underline;
  color: #3182ce;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .auth-header h2 {
    font-size: 1.4rem;
  }

  .auth-header p {
    font-size: 0.8rem;
  }

  .input-group input {
    padding: 0.7rem;
  }

  .auth-btn {
    padding: 0.8rem;
    font-size: 0.95rem;
  }
}
</style>
