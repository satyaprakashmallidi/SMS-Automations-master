import PropTypes from 'prop-types'
import * as Icons from 'lucide-react'

function SaveButton({ onClick, loading = false }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
    >
      <Icons.Save className="w-4 h-4" strokeWidth={1.5} />
      {loading ? 'Saving...' : 'Save Changes'}
    </button>
  )
}

SaveButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default SaveButton
