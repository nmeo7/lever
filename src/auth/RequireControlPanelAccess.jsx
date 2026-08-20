import { Navigate } from 'react-router-dom'
import { useAuthStore } from './store'

export const RequireControlPanelAccess = ({ children }) => {
  const user = useAuthStore((s) => s.user)
  const hasAccess = user?.isPlatformAdmin || (user?.groupId && user?.roleId === 'admin')

  if (!hasAccess) {
    return <Navigate to="/app" replace />
  }

  return children
}
