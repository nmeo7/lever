import { useMutation } from '@tanstack/react-query'
import { callFn } from '@/firebase'
import { useAuthStore } from './store'

export const useLogin = () => {
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await callFn('authLogin')({ email, password })
      return data
    },
    onSuccess: ({ user, token }) => setSession(user, token),
  })
}

export const useLogout = () => {
  const clearSession = useAuthStore((s) => s.clearSession)
  return clearSession
}
