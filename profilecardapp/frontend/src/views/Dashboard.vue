<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Your Profile Dashboard</h1>
      <p>Manage and view your professional profile</p>
    </div>

    <div class="dashboard-content">
      <div class="profile-section">
        <ProfileCard 
          :profile="profile" 
          :loading="loading" 
          :editable="true"
          @edit="navigateToProfile"
        />
      </div>

      <div class="actions-section">
        <div class="action-cards">
          <div class="action-card" @click="navigateToProfile">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"/>
              </svg>
            </div>
            <h3>Edit Profile</h3>
            <p>Update your personal and professional information</p>
          </div>

          <div class="action-card" @click="refreshProfile">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M23 4v6h-6" stroke="currentColor"/>
                <path d="M1 20v-6h6" stroke="currentColor"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor"/>
              </svg>
            </div>
            <h3>Refresh</h3>
            <p>Reload your profile data</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProfileCard from '../components/ProfileCard.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const profile = ref({})
const loading = ref(false)

const navigateToProfile = () => {
  router.push('/profile')
}

const fetchProfile = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:8000/backend/api/profile.php', {
      method: 'GET',
      headers: authStore.getAuthHeaders()
    })

    if (response.ok) {
      const data = await response.json()
      profile.value = data
    } else {
      console.error('Failed to fetch profile')
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    loading.value = false
  }
}

const refreshProfile = () => {
  fetchProfile()
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
}

.dashboard-header h1 {
  color: #1e293b;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.dashboard-header p {
  color: #64748b;
  font-size: 16px;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.profile-section {
  display: flex;
  justify-content: center;
}

.actions-section {
  padding-top: 20px;
}

.action-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06);
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  margin-bottom: 16px;
}

.action-card h3 {
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.action-card p {
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 968px) {
  .dashboard-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .profile-section {
    order: 2;
  }
  
  .actions-section {
    order: 1;
    padding-top: 0;
  }
}

@media (max-width: 640px) {
  .dashboard-header h1 {
    font-size: 24px;
  }
  
  .dashboard-header p {
    font-size: 14px;
  }
  
  .action-card {
    padding: 20px;
  }
}
</style>
