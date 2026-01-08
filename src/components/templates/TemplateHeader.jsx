import PropTypes from 'prop-types'
import { Plus } from 'lucide-react'
import Button from '../Button'

function TemplateHeader({ onNewTemplate }) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Message Templates</h1>
        <p className="text-gray-600 mt-2">Create and manage reusable SMS templates for your campaigns</p>
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={onNewTemplate}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        New Template
      </Button>
    </div>
  )
}

TemplateHeader.propTypes = {
  onNewTemplate: PropTypes.func.isRequired,
}

export default TemplateHeader
