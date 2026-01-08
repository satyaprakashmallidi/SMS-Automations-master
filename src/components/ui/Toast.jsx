import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'
import PropTypes from 'prop-types'

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles = {
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
}

const iconColors = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
}

function Toast({ id, type = 'info', message, onClose, duration = 5000 }) {
  const Icon = icons[type]

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, onClose, duration])

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-2 min-w-[300px] max-w-[400px] animate-slide-in ${styles[type]}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[type]}`} />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

Toast.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
}

export default Toast
