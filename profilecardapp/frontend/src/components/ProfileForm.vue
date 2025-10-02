<template>
  <form @submit.prevent="handleSubmit" class="profile-form">
      <div class="form-header">
          <h2>{{ profile.id ? 'Edit Profile' : 'Create Profile' }}</h2>
          <button type="button" @click="$emit('cancel')" class="cancel-btn">
              Cancel
          </button>
      </div>

      <div class="form-grid">
          <div class="form-group">
              <label for="name">Full Name *</label>
              <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  required
                  :class="{ 'error': errors.name }"
                  placeholder="Enter your full name"
              >
              <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>

          <div class="form-group">
              <label for="jobTitle">Job Title</label>
              <input
                  id="jobTitle"
                  v-model="formData.job_title"
                  type="text"
                  placeholder="Enter your job title"
              >
          </div>

          <div class="form-group">
              <label for="location">Location</label>
              <input
                  id="location"
                  v-model="formData.location"
                  type="text"
                  placeholder="Enter your location"
              >
          </div>

          <div class="form-group full-width">
              <label for="summary">Professional Summary</label>
              <textarea
                  id="summary"
                  v-model="formData.summary"
                  rows="4"
                  placeholder="Tell us about yourself, your experience, and skills..."
                  maxlength="500"
              ></textarea>
              <div class="char-count">
                  {{ formData.summary?.length || 0 }}/500
              </div>
          </div>

          <div class="form-group full-width">
              <label for="avatar">Avatar URL</label>
              <input
                  id="avatar"
                  v-model="formData.avatar_url"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  :class="{ 'error': errors.avatar_url }"
              >
              <span v-if="errors.avatar_url" class="error-message">{{ errors.avatar_url }}</span>
              <small>Enter a direct link to your profile picture</small>
          </div>
      </div>

      <div class="form-actions">
          <button type="button" @click="$emit('cancel')" class="btn-secondary">
              Cancel
          </button>
          <button type="submit" :disabled="loading" class="btn-primary">
              <span v-if="loading">Saving...</span>
              <span v-else>{{ profile.id ? 'Update' : 'Create' }} Profile</span>
          </button>
      </div>

      <div v-if="message" :class="['message', message.type]">
          {{ message.text }}
      </div>
  </form>
</template>

<script setup>
import { reactive, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  profile: {
      type: Object,
      default: () => ({})
  },
  loading: {
      type: Boolean,
      default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = reactive({
  name: '',
  job_title: '',
  location: '',
  summary: '',
  avatar_url: ''
})

const errors = reactive({})
const message = reactive({})

// Watch for profile changes and update form data
watch(() => props.profile, (newProfile) => {
  Object.assign(formData, newProfile)
}, { immediate: true })

const validateForm = () => {
  let isValid = true
  const newErrors = {}

  if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
      isValid = false
  }

  if (formData.avatar_url && !isValidUrl(formData.avatar_url)) {
      newErrors.avatar_url = 'Please enter a valid URL'
      isValid = false
  }

  Object.assign(errors, newErrors)
  return isValid
}

const isValidUrl = (string) => {
  try {
      new URL(string)
      return true
  } catch (_) {
      return false
  }
}

const handleSubmit = () => {
  if (!validateForm()) return

  emit('submit', { ...formData })
}

// Clear errors when user starts typing
watch(formData, () => {
  if (message.text) {
      message.text = ''
  }
}, { deep: true })
</script>

<style scoped>
.profile-form {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.form-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 20px;
  font-weight: 600;
}

.cancel-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
}

.cancel-btn:hover {
  background: #f8fafc;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
  font-size: 14px;
}

input, textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input.error, textarea.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

small {
  color: #64748b;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f8fafc;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f1f5f9;
}

.message {
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  font-size: 14px;
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

@media (max-width: 640px) {
  .profile-form {
      margin: 0 16px;
      padding: 20px;
  }
  
  .form-grid {
      grid-template-columns: 1fr;
  }
  
  .form-actions {
      flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
      width: 100%;
  }
}
</style>
