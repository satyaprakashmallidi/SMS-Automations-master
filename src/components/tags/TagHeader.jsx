import PropTypes from 'prop-types'
import { Plus, Sparkles } from 'lucide-react'
import Button from '../Button'

function TagHeader({ onAddTag, onAutoApplyAll, isAutoApplyingAll }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Tag Management</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Automatically categorize customers with smart tags for targeted campaigns
        </p>
      </div>
      <div className="flex flex-row flex-wrap gap-3 w-full sm:w-auto justify-center sm:justify-end">
        {onAutoApplyAll && (
          <Button
            variant="secondary"
            size="md"
            onClick={onAutoApplyAll}
            className="flex items-center gap-2 whitespace-nowrap"
            disabled={isAutoApplyingAll}
          >
            {isAutoApplyingAll ? (
              <>
                <span className="w-4 h-4 border-2 border-blue-200 border-t-transparent rounded-full animate-spin" />
                Applying tags...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Auto-apply tags
              </>
            )}
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          onClick={onAddTag}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Tag
        </Button>
      </div>
    </div>
  )
}

TagHeader.propTypes = {
  onAddTag: PropTypes.func.isRequired,
  onAutoApplyAll: PropTypes.func,
  isAutoApplyingAll: PropTypes.bool,
}

export default TagHeader
