<template>
  <div class="profile-card" :class="{ 'loading': loading }">
      <div class="profile-header">
          <div class="avatar">
              <img 
                  v-if="profile.avatar_url" 
                  :src="profile.avatar_url" 
                  :alt="profile.name"
                  @error="handleImageError"
              >
              <div v-else class="avatar-placeholder">
                  {{ getInitials(profile.name) }}
              </div>
          </div>
          <button v-if="editable" @click="$emit('edit')" class="edit-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"/>
              </svg>
              Edit
          </button>
      </div>
      
      <div class="profile-body">
          <h2 class="name">{{ profile.name || 'Full Name' }}</h2>
          <p class="job-title" v-if="profile.job_title">{{ profile.job_title }}</p>
          <p class="location" v-if="profile.location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor"/>
              </svg>
              {{ profile.location }}
          </p>
          
          <div class="summary" v-if="profile.summary">
              <h3>About</h3>
              <p>{{ profile.summary }}</p>
          </div>
          
          <div v-if="!profile.name" class="empty-state">
              <p>No profile information yet.</p>
              <button v-if="editable" @click="$emit('edit')" class="create-btn">
                  Create Profile
              </button>
          </div>
      </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  profile: {
      type: Object,
      required: true
  },
  loading: {
      type: Boolean,
      default: false
  },
  editable: {
      type: Boolean,
      default: false
  }
})

defineEmits(['edit'])

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
  event.target.nextElementSibling?.style.display = 'block'
}
</script>

<style scoped>
.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
  max-width: 400px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.profile-card.loading {
  opacity: 0.6;
  pointer-events: none;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 24px;
}

.edit-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.name {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.job-title {
  color: #64748b;
  font-size: 16px;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
  margin: 0 0 20px 0;
}

.location svg {
  color: #94a3b8;
}

.summary h3 {
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.summary p {
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

.create-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 12px;
}

.create-btn:hover {
  background: #2563eb;
}

@media (max-width: 640px) {
  .profile-card {
      margin: 0 16px;
      padding: 20px;
  }
  
  .profile-header {
      flex-direction: column;
      gap: 16px;
  }
  
  .edit-btn {
      align-self: flex-end;
  }
}
</style>
