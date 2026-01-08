import PropTypes from 'prop-types'
import * as Icons from 'lucide-react'

function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
  change = '',
  changeDirection = 'neutral',
}) {
  const IconComponent = Icons[icon]
  const TrendIcon =
    changeDirection === 'up'
      ? Icons.TrendingUp
      : changeDirection === 'down'
        ? Icons.TrendingDown
        : null
  const changeColor =
    changeDirection === 'up'
      ? 'text-green-600'
      : changeDirection === 'down'
        ? 'text-red-600'
        : 'text-gray-400'

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      {/* Top row: Icon and Percentage change */}
      <div className="flex items-start justify-between mb-4">
        <div className={`${bgColor} p-3 rounded-lg`}>
          {IconComponent && <IconComponent className={`w-6 h-6 ${color}`} />}
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}
          >
            {TrendIcon && <TrendIcon className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Value - large, centered */}
      <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{value}</p>

      {/* Title - at bottom */}
      <p className="text-xs md:text-sm text-gray-600 font-normal">{title}</p>
    </div>
  )
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  change: PropTypes.string,
  changeDirection: PropTypes.oneOf(['up', 'down', 'neutral']),
}

export default StatCard
