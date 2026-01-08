import PropTypes from 'prop-types'
import * as Icons from 'lucide-react'

function TagFilterSection({ tags, activeTab, onTabChange, tagFilters, onTagToggle }) {
  const tabs = [
    { id: 'includeAny', label: 'Include ANY', key: 'includeAny' },
    { id: 'requireAll', label: 'Require ALL', key: 'requireAll' },
    { id: 'exclude', label: 'Exclude', key: 'exclude' },
  ]

  const activeTags = tagFilters[activeTab] || []

  return (
    <div className="space-y-4">
      {/* Tab navigation */}
      <div className="flex gap-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tagFilters[tab.key]?.length || 0})
          </button>
        ))}
      </div>

      {/* Tag buttons */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = activeTags.includes(tag.id)
          const IconComponent = Icons[tag.icon] || Icons.Tag
          return (
            <button
              key={tag.id}
              onClick={() => onTagToggle(tag.id)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all inline-flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
              title={tag.definition}
            >
              <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : ''}`} style={{ color: isSelected ? 'white' : tag.color }} />
              <span>{tag.name}</span>
            </button>
          )
        })}
      </div>

      {/* Description */}
      <div className="text-xs text-gray-500">
        {activeTab === 'includeAny' &&
          'Send to customers with ANY of these tags'}
        {activeTab === 'requireAll' &&
          'Send to customers with ALL of these tags'}
        {activeTab === 'exclude' &&
          'Exclude customers with these tags'}
      </div>
    </div>
  )
}

TagFilterSection.propTypes = {
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      definition: PropTypes.string,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  tagFilters: PropTypes.shape({
    includeAny: PropTypes.arrayOf(PropTypes.number),
    requireAll: PropTypes.arrayOf(PropTypes.number),
    exclude: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  onTagToggle: PropTypes.func.isRequired,
}

export default TagFilterSection
