import PropTypes from 'prop-types'
import { Search, X } from 'lucide-react'

function SearchInput({ value = '', onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Search icon with dynamic color */}
      <Search
        className={`
          absolute left-3 top-1/2 transform -translate-y-1/2
          w-5 h-5
          transition-colors duration-200
          ${value ? 'text-blue-500' : 'text-gray-400'}
        `}
      />

      {/* Input field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full
          pl-10 pr-10 py-2.5
          text-sm
          border border-gray-300
          rounded-lg
          bg-white
          transition-all duration-200
          focus:ring-1 focus:ring-blue-400 focus:border-gray-300
          focus:shadow-sm
          hover:border-gray-400
          outline-none
          placeholder:text-gray-400
        `}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className={`
            absolute right-3 top-1/2 transform -translate-y-1/2
            text-gray-400
            hover:text-gray-600
            hover:bg-gray-100
            rounded-full
            p-1
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
}

export default SearchInput
