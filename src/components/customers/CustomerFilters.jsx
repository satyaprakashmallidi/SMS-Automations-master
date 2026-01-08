import PropTypes from 'prop-types'
import * as Icons from 'lucide-react'
import { Search, X } from 'lucide-react'

function CustomerFilters({
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  tabCounts,
  selectedTags = [],
  onTagsChange = () => {},
  availableTags = [],
}) {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'recurring', label: 'Recurring' },
    { id: 'residential', label: 'Residential' },
    { id: 'optedOut', label: 'Opted Out' },
    { id: 'inactive', label: 'Inactive' },
  ]

  const handleTagToggle = (tagId) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId]
    onTagsChange(newSelectedTags)
  }

  return (
    <div className="bg-white p-4 rounded-t-xl border-b border-gray-100 space-y-4">
      {/* Top Row: Search and Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-lg w-full lg:w-auto overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-1 lg:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
              `}
            >
              {tab.label}
              <span className={`ml-2 text-xs ${activeTab === tab.id ? 'text-blue-600 bg-blue-50' : 'text-gray-400 bg-gray-200'} px-1.5 py-0.5 rounded-full`}>
                {tabCounts[tab.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all"
            placeholder="Search customers..."
          />
        </div>
      </div>

      {/* Bottom Row: Tag Filters */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">
            Filter by Tag:
          </span>
          
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id)
            const IconComponent = Icons[tag.icon] || Icons.Tag
            
            return (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`
                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border
                  ${isSelected 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                `}
              >
                <IconComponent className="w-3 h-3" style={{ color: isSelected ? 'white' : tag.color }} />
                {tag.name}
              </button>
            )
          })}
          
          {selectedTags.length > 0 && (
            <button
              onClick={() => onTagsChange([])}
              className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

CustomerFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  tabCounts: PropTypes.object.isRequired,
  selectedTags: PropTypes.array,
  onTagsChange: PropTypes.func,
  availableTags: PropTypes.array,
}

export default CustomerFilters
