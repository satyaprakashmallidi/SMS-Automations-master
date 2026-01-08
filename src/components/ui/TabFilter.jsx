import PropTypes from 'prop-types'

function TabFilter({ tabs, activeTab, onTabChange }) {
  return (
    <div className="bg-white sticky top-0 z-10 py-2">
      {/* Scrollable tab container */}
      <div className="flex gap-2 px-2 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              group
              relative
              px-3 py-2
              text-sm font-medium
              rounded-md
              whitespace-nowrap
              transition-all duration-200
              flex items-center gap-2
              min-w-fit
              ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            {/* Label with truncation */}
            <span className="max-w-[120px] truncate">
              {tab.label}
            </span>

            {/* Count badge */}
            {tab.count !== undefined && (
              <span
                className={`
                  inline-flex items-center justify-center
                  min-w-[20px] h-5
                  px-1.5
                  text-xs font-bold
                  rounded-full
                  transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

TabFilter.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      count: PropTypes.number,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
}

export default TabFilter
