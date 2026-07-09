import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../hooks/useSession'

export function RequireAuth() {
  const { session, loading } = useSession()

  if (loading) return null
  if (!session) return <Navigate to="/connexion" replace />

  return <Outlet />
}
