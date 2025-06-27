<template>
  <div class="auth-overlay">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Passwort vergessen</h2>
          <p>Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen.</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="input-group">
            <label for="email">E-Mail-Adresse:</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              :disabled="loading"
              placeholder="Deine E-Mail-Adresse"
            />
          </div>

          <button type="submit" class="auth-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Wird gesendet...' : 'Link anfordern' }}
          </button>

          <div v-if="message" class="message" :class="messageType">
            {{ message }}
          </div>
        </form>

        <div class="auth-switch">
          <a href="#" @click.prevent="$router.push('/login')">Zurück zum Login</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref('')

const handleSubmit = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value })
    })
    const data = await response.json()
    message.value = data.message
    messageType.value = response.ok ? 'success' : 'error'
  } catch (error) {
    message.value = 'Ein Fehler ist aufgetreten'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>
