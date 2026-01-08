import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'

function QuickActionButton({ icon, label, description, path }) {
  const navigate = useNavigate()
  const IconComponent = Icons[icon]

  return (
    <button
      onClick={() => navigate(path)}
      className="flex-1 bg-white p-3 md:p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all group h-full"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 h-full">
        <div className="bg-blue-50 p-2 md:p-4 rounded-lg group-hover:bg-blue-100 transition-colors flex-shrink-0">
          {IconComponent && <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />}
        </div>
        <div className="text-center md:text-left w-full">
          <p className="text-xs md:text-lg font-medium text-gray-900 leading-tight md:leading-normal">{label}</p>
          <p className="hidden md:block text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </button>
  )
}

QuickActionButton.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
}

export default QuickActionButton
