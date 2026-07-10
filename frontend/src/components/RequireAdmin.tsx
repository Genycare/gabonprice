import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router-dom'
import { fetchMyProfile } from '../lib/profile'
import { useSession } from '../hooks/useSession'

export function RequireAdmin() {
  const { session } = useSession()
  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: fetchMyProfile,
    enabled: !!session,
  })

  if (isLoading) return null
  if (!profile?.is_admin) return <Navigate to="/" replace />

  return <Outlet />
}
