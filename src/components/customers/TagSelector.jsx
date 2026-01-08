import PropTypes from 'prop-types'
import * as Icons from 'lucide-react'

function TagSelector({ selectedTags = [], onChange, availableTags = [], required = false }) {
  const handleTagToggle = (tagId) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId]
    onChange(newSelectedTags)
  }

  if (!availableTags || availableTags.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
        No tags available. Please create tags in the Tags page first.
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Tags
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>

      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id)
          const IconComponent = Icons[tag.icon] || Icons.Tag

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagToggle(tag.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-medium text-sm transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
              style={!isSelected ? { borderColor: tag.color } : {}}
              title={tag.definition}
            >
              <IconComponent className="w-4 h-4" style={{ color: isSelected ? 'white' : tag.color }} />
              <span>{tag.name}</span>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {selectedTags.length === 0
          ? 'Tags are optional. Choose any that help categorize this customer.'
          : `${selectedTags.length} tag${selectedTags.length !== 1 ? 's' : ''} selected`}
      </p>
    </div>
  )
}

TagSelector.propTypes = {
  selectedTags: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func.isRequired,
  availableTags: PropTypes.array,
  required: PropTypes.bool,
}

export default TagSelector
