import { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { ToastContext } from './ToastContext'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((type, message, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, type, message, duration }

    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const value = {
    toasts,
    showToast,
    removeToast,
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
