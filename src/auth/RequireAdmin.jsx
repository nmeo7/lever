import { Navigate } from 'react-router-dom'
import { useAuthStore } from './store'

export const RequireAdmin = ({ children }) => {
  const user = useAuthStore((s) => s.user)

  if (user?.role !== 'admin') {
    return <Navigate to="/app" replace />
  }

  return children
}
