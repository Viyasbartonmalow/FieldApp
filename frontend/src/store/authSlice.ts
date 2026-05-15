import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User, AuthToken } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const getStoredUser = (): User | null => {
  const raw = localStorage.getItem('authUser')
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    localStorage.removeItem('authUser')
    return null
  }
}

const initialState: AuthState = {
  user: getStoredUser(),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; tokens: AuthToken }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.tokens.accessToken
      state.refreshToken = action.payload.tokens.refreshToken
      state.isAuthenticated = true
      state.isLoading = false

      localStorage.setItem('accessToken', action.payload.tokens.accessToken)
      localStorage.setItem('refreshToken', action.payload.tokens.refreshToken)
      localStorage.setItem('authUser', JSON.stringify(action.payload.user))
    },
    loginFailed: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Logout
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null

      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('authUser')
    },

    // Update user
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      localStorage.setItem('authUser', JSON.stringify(action.payload))
    },

    // Refresh token
    refreshTokenSuccess: (state, action: PayloadAction<AuthToken>) => {
      state.accessToken = action.payload.accessToken
      localStorage.setItem('accessToken', action.payload.accessToken)
    },

    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailed,
  logout,
  updateUser,
  refreshTokenSuccess,
  clearError,
} = authSlice.actions

export default authSlice.reducer
