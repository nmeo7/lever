import { create } from 'zustand'

const TOKEN_KEY = 'erp_token'
const USER_KEY = 'erp_user'
const ACTIVE_COMPANY_KEY = 'erp_active_company'

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
  activeCompanyId: localStorage.getItem(ACTIVE_COMPANY_KEY) ?? null,

  setSession: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    const activeCompanyId = user?.companyIds?.[0] ?? null
    if (activeCompanyId) localStorage.setItem(ACTIVE_COMPANY_KEY, activeCompanyId)
    set({ user, token, activeCompanyId })
  },

  setActiveCompany: (companyId) => {
    localStorage.setItem(ACTIVE_COMPANY_KEY, companyId)
    set({ activeCompanyId: companyId })
  },

  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(ACTIVE_COMPANY_KEY)
    set({ user: null, token: null, activeCompanyId: null })
  },
}))
