import { useContext, useMemo } from 'react'
import { ToastContext } from '../context/ToastContext'

export function useToast() {
  const { showToast } = useContext(ToastContext)

  if (!showToast) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return useMemo(
    () => ({
      success: (message, duration) => showToast('success', message, duration),
      error: (message, duration) => showToast('error', message, duration),
      info: (message, duration) => showToast('info', message, duration),
      warning: (message, duration) => showToast('warning', message, duration),
    }),
    [showToast]
  )
}
