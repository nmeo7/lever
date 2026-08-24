import { Navigate } from 'react-router-dom'
import { useAuthStore } from './store'

export const RequireGuest = ({ children }) => {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  if (token && user?.companyIds?.length) {
    return <Navigate to="/app" replace />
  }

  return children
}
