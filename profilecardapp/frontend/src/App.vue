<template>
  <div id="app">
    <header class="app-header" v-if="authStore.isAuthenticated">
      <nav class="nav">
        <div class="nav-brand">
          <h1>ProfileCards</h1>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Dashboard</router-link>
          <router-link to="/profile" class="nav-link">My Profile</router-link>
          <button @click="handleLogout" class="logout-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor"/>
              <polyline points="16,17 21,12 16,7" stroke="currentColor"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>
    </header>

    <main :class="['app-main', { 'with-header': authStore.isAuthenticated }]">
      <router-view />
    </main>

    <div v-if="globalLoading" class="global-loading">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

    <div v-if="globalError" class="error-toast">
      <div class="toast-content">
        <span class="toast-message">{{ globalError }}</span>
        <button @click="clearGlobalError" class="toast-close">
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Global state
const globalLoading = ref(false)
const loadingMessage = ref('Loading...')
const globalError = ref('')
const networkStatus = ref(navigator.onLine)

// Global initialization
const initializeApp = async () => {
  globalLoading.value = true
  loadingMessage.value = 'Initializing application...'
  
  try {
    await checkAuthStatus()
    await initializeServiceWorker()
    setupErrorHandling()
    setupNetworkMonitoring()
    await loadAppConfig()
    
    console.log('App initialized successfully')
  } catch (error) {
    console.error('App initialization failed:', error)
    showGlobalError('Failed to initialize application')
  } finally {
    globalLoading.value = false
  }
}

//Authentication Status Check
const checkAuthStatus = async () => {
  const token = localStorage.getItem('auth_token')
  const userId = localStorage.getItem('user_id')
  
  if (token && userId) {
    // Verify token is valid
    try {
      const response = await fetch('http://localhost:8000/backend/api/profile.php', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        // If token is invalid, clear local storage
        authStore.logout()
      }
      // If token is valid - authStore already has the token from localStorage
    } catch (error) {
      console.warn('Auth check failed, user will need to re-login')
      authStore.logout()
    }
  }
}

const initializeServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered: ', registration)
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        console.log('SW update found')
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, show update notification
            showGlobalError('New version available. Refresh to update.', 0)
          }
        })
      })
    } catch (error) {
      console.warn('Service Worker registration failed: ', error)
    }
  }
}

const setupErrorHandling = () => {
  // Vue error handler
  const originalErrorHandler = window.Vue?.config.errorHandler
  
  window.Vue.config.errorHandler = (error, instance, info) => {
    console.error('Vue error:', error, 'in component:', instance, 'info:', info)
    showGlobalError('An unexpected error occurred')
    
    // Call original handler if it exists
    if (originalErrorHandler) {
      originalErrorHandler(error, instance, info)
    }
  }
  
  // Window error handler
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    showGlobalError('A system error occurred')
  })
  
  // Unhandled promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    showGlobalError('An operation failed to complete')
    event.preventDefault()
  })
}

//Network Status Monitoring
const setupNetworkMonitoring = () => {
  const updateNetworkStatus = () => {
    networkStatus.value = navigator.onLine
    if (!navigator.onLine) {
      showGlobalError('You are currently offline')
    } else {
      clearGlobalError()
    }
  }
  
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
}

//App Configuration
const loadAppConfig = async () => {
  try {
    // Load app-specific configuration
    const config = {
      apiBaseUrl: 'http://localhost:8000/backend/api',
      maxFileSize: 5 * 1024 * 1024,
      enableAnalytics: false,
      features: {
        profileUpdates: true,
        imageUpload: true
      }
    }
    window.appConfig = config
  } catch (error) {
    console.warn('Failed to load app config:', error)
  }
}

const showGlobalLoading = (message = 'Loading...') => {
  globalLoading.value = true
  loadingMessage.value = message
}

const hideGlobalLoading = () => {
  globalLoading.value = false
}

const showGlobalError = (message, autoHideDelay = 5000) => {
  globalError.value = message
  
  if (autoHideDelay > 0) {
    setTimeout(() => {
      clearGlobalError()
    }, autoHideDelay)
  }
}

const clearGlobalError = () => {
  globalError.value = ''
}

const setupGlobalEventBus = () => {
  window.appEvents = {
    emit: (event, data) => {
      window.dispatchEvent(new CustomEvent(event, { detail: data }))
    },
    on: (event, callback) => {
      window.addEventListener(event, (e) => callback(e.detail))
    },
    off: (event, callback) => {
      window.removeEventListener(event, (e) => callback(e.detail))
    }
  }
  
  window.appEvents.on('showGlobalLoading', (data) => {
    showGlobalLoading(data.message)
  })
  
  window.appEvents.on('hideGlobalLoading', () => {
    hideGlobalLoading()
  })
  
  window.appEvents.on('showGlobalError', (data) => {
    showGlobalError(data.message, data.delay)
  })
}

// Route-based loading states
const setupRouteLoading = () => {
  router.beforeEach((to, from, next) => {
    // Show loading for route changes that require auth
    if (to.meta.requiresAuth) {
      showGlobalLoading('Loading...')
    }
    next()
  })
  
  router.afterEach(() => {
    // Hide loading after route is fully loaded
    setTimeout(() => {
      hideGlobalLoading()
    }, 100)
  })
}

// Handle logout
const handleLogout = async () => {
  showGlobalLoading('Logging out...')
  
  try {
    // Call logout endpoint to invalidate session on server
    await fetch('http://localhost:8000/backend/api/auth.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ action: 'logout' })
    })
  } catch (error) {
    console.warn('Logout API call failed:', error)
  } finally {
    authStore.logout()
    hideGlobalLoading()
  }
}

const cleanup = () => {
  // Remove event listeners
  window.removeEventListener('online', updateNetworkStatus)
  window.removeEventListener('offline', updateNetworkStatus)
  
  if (window.appEvents) {
    delete window.appEvents
  }
}

// Watch for authentication changes
watch(() => authStore.isAuthenticated, (newVal) => {
  if (!newVal && router.currentRoute.value.meta.requiresAuth) {
    router.push('/login')
  }
})

// Initialize app on mount
onMounted(() => {
  initializeApp()
  setupGlobalEventBus()
  setupRouteLoading()
})

// Cleanup on unmount
onUnmounted(() => {
  cleanup()
})
</script>


<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8fafc;
}

#app {
  min-height: 100vh;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
}

.nav-brand h1 {
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #334155;
  background: #f8fafc;
}

.nav-link.router-link-active {
  color: #3b82f6;
  background: #eff6ff;
}

.logout-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 12px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #374151;
}

.app-main {
  min-height: 100vh;
}

.app-main.with-header {
  min-height: calc(100vh - 64px);
  padding: 24px;
}

.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-content {
  text-align: center;
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.loading-content p {
  margin-top: 16px;
  color: #64748b;
  font-size: 14px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-left: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  left: 20px;
  max-width: 400px;
  margin: 0 auto;
  background: #ef4444;
  color: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.toast-content {
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 12px 16px;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

@keyframes slideIn {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


/* Responsive design */
@media (max-width: 768px) {
  .nav {
    padding: 0 16px;
  }
  
  .nav-links {
    gap: 12px;
  }
  
  .app-main.with-header {
    padding: 16px;
  }
  
  .nav-brand h1 {
    font-size: 18px;
  }
}

@media (max-width: 640px) {
  .error-toast {
    top: 16px;
    right: 16px;
    left: 16px;
  }
  
  .loading-content {
    margin: 0 16px;
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .nav {
    flex-direction: column;
    height: auto;
    padding: 12px 16px;
    gap: 12px;
  }
  
  .nav-links {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
