import { useContext } from 'react'
import Toast from './Toast'
import { ToastContext } from '../../context/ToastContext'

function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext)

  return (
    <div className="fixed top-8 right-8 z-50 flex flex-col gap-4 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={removeToast}
            duration={toast.duration}
          />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
