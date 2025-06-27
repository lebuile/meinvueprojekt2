<template>
  <div class="auth-overlay">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Neues Passwort</h2>
          <p>Lege dein neues Passwort fest.</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="input-group">
            <label for="password">Neues Passwort:</label>
            <input
              type="password"
              id="password"
              v-model="password"
              required
              :disabled="loading"
              placeholder="Mindestens 8 Zeichen"
              minlength="8"
            />
          </div>

          <div class="input-group">
            <label for="confirmPassword">Passwort bestätigen:</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              required
              :disabled="loading"
              placeholder="Passwort wiederholen"
            />
          </div>

          <button type="submit" class="auth-btn" :disabled="loading || !isValid">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Wird gespeichert...' : 'Passwort speichern' }}
          </button>

          <div v-if="message" class="message" :class="messageType">
            {{ message }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref('')

const isValid = computed(() =>
  password.value.length >= 8 && password.value === confirmPassword.value
)

const handleSubmit = async () => {
  loading.value = true
  const token = route.query.token as string

  try {
    const response = await fetch('http://localhost:8080/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        password: password.value
      })
    })

    const data = await response.json()
    if (response.ok) {
      message.value = 'Passwort erfolgreich zurückgesetzt'
      messageType.value = 'success'
      setTimeout(() => router.push('/login'), 2000)
    } else {
      message.value = data.error || 'Ein Fehler ist aufgetreten'
      messageType.value = 'error'
    }
  } catch (error) {
    message.value = 'Ein Fehler ist aufgetreten'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>
