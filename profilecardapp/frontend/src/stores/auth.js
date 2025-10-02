import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('auth_token'))
    const userId = ref(localStorage.getItem('user_id'))
    const router = useRouter()

    const isAuthenticated = computed(() => !!token.value)

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8000/backend/api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login',
                    email,
                    password
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Login failed')
            }

            token.value = data.token
            userId.value = data.user_id
            
            localStorage.setItem('auth_token', data.token)
            localStorage.setItem('user_id', data.user_id)

            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const register = async (email, password) => {
        try {
            const response = await fetch('http://localhost:8000/backend/api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'register',
                    email,
                    password
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed')
            }

            token.value = data.token
            userId.value = data.user_id
            
            localStorage.setItem('auth_token', data.token)
            localStorage.setItem('user_id', data.user_id)

            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const logout = () => {
        token.value = null
        userId.value = null
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_id')
        router.push('/login')
    }

    const getAuthHeaders = () => {
        return {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json'
        }
    }

    return {
        token,
        userId,
        isAuthenticated,
        login,
        register,
        logout,
        getAuthHeaders
    }
})
