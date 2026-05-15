import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import type { UserRole } from '@/types'

/**
 * Returns the current user's role and convenience boolean flags.
 * Add new roles here as the app grows.
 */
export const useRole = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const role: UserRole | null = (user?.role as UserRole) ?? null

  return {
    role,
    isSuperintendent: role === 'superintendent',
    isForeman: role === 'foreman',
    isAdmin: role === 'admin',
    isCrew: role === 'crew',
    /** Returns true if the current user has any of the given roles */
    hasRole: (...roles: UserRole[]) => role !== null && roles.includes(role),
  }
}

export default useRole
