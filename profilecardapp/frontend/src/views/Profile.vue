<template>
  <div class="profile-view">
    <div class="profile-header">
      <h1>Edit Your Profile</h1>
      <p>Update your professional information</p>
    </div>

    <div class="profile-content">
      <div class="preview-section">
        <h3>Preview</h3>
        <ProfileCard 
          :profile="formData" 
          :loading="loading" 
          :editable="false"
        />
      </div>

      <div class="form-section">
        <ProfileForm
          :profile="currentProfile"
          :loading="saving"
          @submit="handleSaveProfile"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProfileCard from '../components/ProfileCard.vue'
import ProfileForm from '../components/ProfileForm.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const currentProfile = ref({})
const loading = ref(false)
const saving = ref(false)

const formData = reactive({
  name: '',
  job_title: '',
  location: '',
  summary: '',
  avatar_url: ''
})

const fetchProfile = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:8000/backend/api/profile.php', {
      method: 'GET',
      headers: authStore.getAuthHeaders()
    })

    if (response.ok) {
      const data = await response.json()
      currentProfile.value = data
      Object.assign(formData, data)
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    loading.value = false
  }
}

const handleSaveProfile = async (profileData) => {
  saving.value = true
  try {
    const response = await fetch('http://localhost:8000/backend/api/profile.php', {
      method: 'POST',
      headers: authStore.getAuthHeaders(),
      body: JSON.stringify(profileData)
    })

    if (response.ok) {
      // Update local data
      Object.assign(formData, profileData)
      currentProfile.value = { ...profileData }
      
      // Redirect to dashboard
      router.push('/')
    } else {
      const data = await response.json()
      console.error('Failed to save profile:', data.message)
    }
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  router.push('/')
}

// Update formData when currentProfile changes
onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-view {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.profile-header h1 {
  color: #1e293b;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.profile-header p {
  color: #64748b;
  font-size: 16px;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.preview-section h3 {
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-section {
  position: sticky;
  top: 100px;
}

@media (max-width: 968px) {
  .profile-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .preview-section {
    order: 2;
  }
  
  .form-section {
    order: 1;
    position: static;
  }
}

@media (max-width: 640px) {
  .profile-header h1 {
    font-size: 24px;
  }
  
  .profile-header p {
    font-size: 14px;
  }
}
</style>
