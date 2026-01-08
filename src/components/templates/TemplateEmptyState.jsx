import PropTypes from 'prop-types'
import { Plus } from 'lucide-react'
import Button from '../Button'

function TemplateEmptyState({ onCreateTemplate }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Plus className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
      <p className="text-gray-600 mb-6">Get started by creating your first message template</p>
      <Button
        variant="primary"
        size="md"
        onClick={onCreateTemplate}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Template
      </Button>
    </div>
  )
}

TemplateEmptyState.propTypes = {
  onCreateTemplate: PropTypes.func.isRequired,
}

export default TemplateEmptyState
