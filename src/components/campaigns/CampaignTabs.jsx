import PropTypes from 'prop-types'

function CampaignTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="border-b border-gray-200 overflow-x-auto no-scrollbar">
      <div className="flex gap-4 sm:gap-8 px-2 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-1 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
    </div>
  )
}

CampaignTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
}

export default CampaignTabs
