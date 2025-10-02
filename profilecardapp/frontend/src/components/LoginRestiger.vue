<template>
  <div class="auth-container">
      <div class="auth-card">
          <div class="auth-header">
              <h1>{{ isLogin ? 'Welcome Back' : 'Create Account' }}</h1>
              <p>{{ isLogin ? 'Sign in to your account' : 'Get started with your profile' }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="auth-form">
              <div class="form-group">
                  <label for="email">Email Address</label>
                  <input
                      id="email"
                      v-model="formData.email"
                      type="email"
                      required
                      placeholder="Enter your email"
                      :class="{ 'error': errors.email }"
                  >
                  <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>

              <div class="form-group">
                  <label for="password">Password</label>
                  <input
                      id="password"
                      v-model="formData.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      placeholder="Enter your password"
                      :class="{ 'error': errors.password }"
                  >
                  <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path v-if="showPassword" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor"/>
                          <circle v-if="showPassword" cx="12" cy="12" r="3" stroke="currentColor"/>
                          <path v-else d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor"/>
                          <line v-else x1="1" y1="1" x2="23" y2="23" stroke="currentColor"/>
                      </svg>
                  </button>
                  <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
              </div>

              <div v-if="!isLogin" class="form-group">
                  <label for="confirmPassword">Confirm Password</label>
                  <input
                      id="confirmPassword"
                      v-model="formData.confirmPassword"
                      type="password"
                      required
                      placeholder="Confirm your password"
                      :class="{ 'error': errors.confirmPassword }"
                  >
                  <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
              </div>

              <button type="submit" :disabled="loading" class="submit-btn">
                  <span v-if="loading">
                      <svg class="spinner" width="20" height="20" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="32" stroke-dashoffset="32">
                              <animate attributeName="stroke-dashoffset" dur="1s" values="32;0" repeatCount="indefinite"/>
                          </circle>
                      </svg>
                      Processing...
                  </span>
                  <span v-else>{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
              </button>

              <div v-if="message" :class="['message', message.type]">
                  {{ message.text }}
              </div>
          </form>

          <div class="auth-footer">
              <p>
                  {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
                  <button type="button" @click="toggleMode" class="mode-toggle">
                      {{ isLogin ? 'Sign up' : 'Sign in' }}
                  </button>
              </p>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const isLogin = ref(true)
const loading = ref(false)
const showPassword = ref(false)

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({})
const message = reactive({})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  resetForm()
}

const resetForm = () => {
  Object.keys(formData).forEach(key => {
      formData[key] = ''
  })
  Object.keys(errors).forEach(key => {
      delete errors[key]
  })
  message.text = ''
}

const validateForm = () => {
  let isValid = true
  const newErrors = {}

  if (!formData.email) {
      newErrors.email = 'Email is required'
      isValid = false
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
      isValid = false
  }

  if (!formData.password) {
      newErrors.password = 'Password is required'
      isValid = false
  } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
  }

  if (!isLogin.value) {
      if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match'
          isValid = false
      }
  }

  Object.assign(errors, newErrors)
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  message.text = ''

  try {
      let result
      if (isLogin.value) {
          result = await authStore.login(formData.email, formData.password)
      } else {
          result = await authStore.register(formData.email, formData.password)
      }

      if (result.success) {
          message.type = 'success'
          message.text = isLogin.value ? 'Login successful!' : 'Account created successfully!'
          router.push('/')
      } else {
          message.type = 'error'
          message.text = result.error
      }
  } catch (error) {
      message.type = 'error'
      message.text = 'An unexpected error occurred'
  } finally {
      loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 32px;
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-header h1 {
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.auth-header p {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.auth-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 38px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
}

.submit-btn {
  width: 100%;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.message {
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
}

.message.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.message.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.auth-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.auth-footer p {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.mode-toggle {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-weight: 500;
  text-decoration: underline;
}

.mode-toggle:hover {
  color: #2563eb;
}

@media (max-width: 480px) {
  .auth-card {
      padding: 24px;
  }
  
  .auth-container {
      padding: 16px;
  }
}
</style>

