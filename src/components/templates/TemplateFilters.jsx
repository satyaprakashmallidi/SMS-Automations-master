import PropTypes from 'prop-types'
import SearchInput from '../ui/SearchInput'

function TemplateFilters({ searchTerm, onSearchChange, templateCount }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <SearchInput
        placeholder="Search templates..."
        value={searchTerm}
        onChange={onSearchChange}
        className="w-80"
      />
      <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm font-medium text-blue-700 whitespace-nowrap">
        All Templates ({templateCount})
      </div>
    </div>
  )
}

TemplateFilters.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  templateCount: PropTypes.number.isRequired,
}

export default TemplateFilters
