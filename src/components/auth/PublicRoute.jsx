import PropTypes from 'prop-types'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired
}
