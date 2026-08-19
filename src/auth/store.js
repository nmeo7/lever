import { create } from 'zustand'

const TOKEN_KEY = 'erp_token'
const USER_KEY = 'erp_user'

const loadStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const useAuthStore = create((set) => ({
  user: loadStoredUser(),
  token: localStorage.getItem(TOKEN_KEY) ?? null,

  setSession: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user, token })
  },

  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, token: null })
  },
}))
