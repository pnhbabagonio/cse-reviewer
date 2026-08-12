const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Token management
let authToken = localStorage.getItem('cse_auth_token') || null
let guestToken = localStorage.getItem('cse_guest_token') || null

export const setAuthToken = (token) => {
  authToken = token
  if (token) {
    localStorage.setItem('cse_auth_token', token)
  } else {
    localStorage.removeItem('cse_auth_token')
  }
}

export const getAuthToken = () => authToken

export const setGuestToken = (token) => {
  guestToken = token
  if (token) {
    localStorage.setItem('cse_guest_token', token)
  } else {
    localStorage.removeItem('cse_guest_token')
  }
}

export const getGuestToken = () => guestToken

// Generate a guest token if none exists
export const ensureGuestToken = () => {
  if (!guestToken) {
    guestToken = 'guest-' + crypto.randomUUID()
    localStorage.setItem('cse_guest_token', guestToken)
  }
  return guestToken
}

// Core request function
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  }

  // Attach auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const config = {
    ...options,
    headers,
  }

  // Don't set Content-Type for FormData (image uploads)
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  try {
    const response = await fetch(url, config)

    // Handle 401 Unauthorized — clear token
    if (response.status === 401) {
      setAuthToken(null)
      throw new ApiError('Session expired. Please log in again.', 401)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null
    }

    const data = await response.json()

    if (!response.ok) {
      const message = data.message || data.error || 'Something went wrong'
      throw new ApiError(message, response.status, data.errors)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('Network error. Please check your connection.', 0)
  }
}

// Custom error class
export class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// ──────────────────────────────────────
// Auth API
// ──────────────────────────────────────

export const authAPI = {
  register: (data) =>
    request('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data) =>
    request('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUser: () =>
    request('/user'),

  logout: () =>
    request('/logout', { method: 'POST' }),
}

// ──────────────────────────────────────
// Questions API
// ──────────────────────────────────────

export const questionsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams()
    if (params.category) query.set('category', params.category)
    if (params.categories) query.set('categories', params.categories.join(','))
    if (params.subcategory) query.set('subcategory', params.subcategory)
    if (params.difficulty) query.set('difficulty', params.difficulty)
    if (params.ids) query.set('ids', params.ids.join(','))
    const qs = query.toString()
    return request(`/questions${qs ? '?' + qs : ''}`)
  },

  getById: (id) =>
    request(`/questions/${id}`),

  getPassageGroups: (params = {}) => {
    const query = new URLSearchParams()
    if (params.category) query.set('category', params.category)
    if (params.categories) query.set('categories', params.categories.join(','))
    if (params.difficulty) query.set('difficulty', params.difficulty)
    const qs = query.toString()
    return request(`/passage-groups${qs ? '?' + qs : ''}`)
  },
}

// ──────────────────────────────────────
// Sessions API
// ──────────────────────────────────────

export const sessionsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams()
    if (params.guest_token) query.set('guest_token', params.guest_token)
    if (params.page) query.set('page', params.page)
    const qs = query.toString()
    return request(`/sessions${qs ? '?' + qs : ''}`)
  },

  getById: (id) =>
    request(`/sessions/${id}`),

  save: (data) =>
    request('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        guest_token: getGuestToken(),
      }),
    }),

  saveGuest: (data) =>
    request('/guest-sessions', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        guest_token: ensureGuestToken(),
      }),
    }),
}

// ──────────────────────────────────────
// Bookmarks API
// ──────────────────────────────────────

export const bookmarksAPI = {
  getAll: () =>
    request('/bookmarks'),

  add: (questionId) =>
    request(`/bookmarks/${questionId}`, { method: 'POST' }),

  remove: (questionId) =>
    request(`/bookmarks/${questionId}`, { method: 'DELETE' }),

  sync: (questionIds) =>
    request('/bookmarks/sync', {
      method: 'POST',
      body: JSON.stringify({ question_ids: questionIds }),
    }),
}

// ──────────────────────────────────────
// Flags API
// ──────────────────────────────────────

export const flagsAPI = {
  getAll: () =>
    request('/flags'),

  add: (questionId, reason) =>
    request(`/flags/${questionId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  remove: (questionId) =>
    request(`/flags/${questionId}`, { method: 'DELETE' }),
}

// ──────────────────────────────────────
// Stats API
// ──────────────────────────────────────

export const statsAPI = {
  get: () =>
    request('/stats'),

  getCategories: () =>
    request('/stats/categories'),
}

// ──────────────────────────────────────
// Leaderboard API
// ──────────────────────────────────────

export const leaderboardAPI = {
  getAccuracy: () =>
    request('/leaderboard/accuracy'),

  getStreak: () =>
    request('/leaderboard/streak'),

  getSimulator: () =>
    request('/leaderboard/simulator'),

  getWeekly: () =>
    request('/leaderboard/weekly'),
}

export default {
  auth: authAPI,
  questions: questionsAPI,
  sessions: sessionsAPI,
  bookmarks: bookmarksAPI,
  flags: flagsAPI,
  stats: statsAPI,
  leaderboard: leaderboardAPI,
  setAuthToken,
  getAuthToken,
  setGuestToken,
  getGuestToken,
  ensureGuestToken,
}