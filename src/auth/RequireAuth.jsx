import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store'

export const RequireAuth = ({ children }) => {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!token || !user?.orgId) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
