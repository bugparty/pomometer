import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  email: string
  name: string
  picture: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
  isLoading: false,
  error: null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false
}

// Async operation to check login status when the page loads
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      if (typeof window === 'undefined') return null
      
      const token = localStorage.getItem('auth_token')
      if (!token) {
        return null
      }

      // If a token exists, try to fetch user information
      const result = await dispatch(fetchUserProfile())
      if (fetchUserProfile.fulfilled.match(result)) {
        return result.payload
      } else if (fetchUserProfile.rejected.match(result)) {
        // If fetching user information fails, remove the invalid token
        localStorage.removeItem('auth_token')
        localStorage.removeItem('google_access_token')
        return null
      }
    } catch (error) {
      return rejectWithValue('Auth check failed')
    }
  }
)

// Define login parameter type
type GoogleLoginParams = string | {
  credential: string;
  accessToken?: string;
  useOAuthEndpoint?: boolean;
};

// Request body shapes for Google login endpoints
type GoogleLoginBody =
  | { credential: string }
  | { idToken: string; accessToken?: string };

// Get the base URL of the current page
const getCurrentApiBaseUrl = (): string => {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
  return window.location.origin
}

// Async operation: Google login
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (params: GoogleLoginParams, { rejectWithValue }) => {
    try {
      const apiBaseUrl = getCurrentApiBaseUrl()
      
      let endpoint = `${apiBaseUrl}/api/auth/google`
      let body: GoogleLoginBody
      
      if (typeof params === 'string') {
        // Old format: credential string only
        body = { credential: params }
      } else {
        // New format: object containing OAuth information
        if (params.useOAuthEndpoint) {
          endpoint = `${apiBaseUrl}/api/auth/google/oauth`
          body = {
            idToken: params.credential,
            accessToken: params.accessToken
          }
        } else {
          body = { credential: params.credential }
        }
      }
      
      console.log('Making request to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json() as { 
        success: boolean; 
        error?: string; 
        token?: string; 
        user?: User;
        googleAccessToken?: string;
      }

      if (!data.success) {
        return rejectWithValue(data.error || 'Login failed')
      }

      if (!data.token) {
        return rejectWithValue('No token received')
      }

      // Save the token to localStorage
      localStorage.setItem('auth_token', data.token)
      
      // If a Google access token is present, save it as well
      if (data.googleAccessToken) {
        localStorage.setItem('google_access_token', data.googleAccessToken)
      }

      return data
    } catch (error) {
      return rejectWithValue('Network error')
    }
  }
)

// Async operation: fetch user information
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState }
      const token = state.auth.token

      if (!token) {
        return rejectWithValue('No token available')
      }

      const apiBaseUrl = getCurrentApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json() as { success: boolean; error?: string; user?: User }

      if (!data.success) {
        return rejectWithValue(data.error || 'Failed to fetch profile')
      }

      return data.user
    } catch (error) {
      return rejectWithValue('Network error')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('google_access_token')
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.user = action.payload
          state.isAuthenticated = true
        } else {
          state.user = null
          state.isAuthenticated = false
          state.token = null
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.token = null
      })
      // Google login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user || null
        state.token = action.payload.token || null
        state.error = null
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload || null
        state.isAuthenticated = true
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.token = null
        localStorage.removeItem('auth_token')
        localStorage.removeItem('google_access_token')
      })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
