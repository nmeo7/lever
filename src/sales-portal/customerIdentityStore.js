import { create } from 'zustand'

const IDENTITY_KEY = 'lever_customer_identity'

const loadStoredIdentity = () => {
	const raw = localStorage.getItem(IDENTITY_KEY)
	if (!raw) return null
	try {
		return JSON.parse(raw)
	} catch {
		return null
	}
}

export const useCustomerIdentityStore = create((set) => ({
	identity: loadStoredIdentity(),

	setIdentity: (identity) => {
		localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity))
		set({ identity })
	},
}))
