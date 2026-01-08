import PropTypes from 'prop-types'
import { Edit2, Trash2 } from 'lucide-react'
import Badge from '../ui/Badge'

function TemplateCard({ template, onEdit, onDelete }) {
  const getCategoryVariant = (category) => {
    const variants = {
      Welcome: 'active',
      Promotional: 'pending',
      Reactivation: 'inactive',
      Retention: 'active',
      Reminder: 'pending',
      'Follow Up': 'pending',
      Seasonal: 'pending',
    }
    return variants[category] || 'inactive'
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
        <Badge variant={getCategoryVariant(template.category)}>{template.category}</Badge>
      </div>

      {/* Message Preview */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{template.message}</p>

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {template.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <span className="text-xs text-gray-500 font-medium">{template.characterCount} chars</span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(template)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Edit template"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
            title="Delete template"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

TemplateCard.propTypes = {
  template: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    characterCount: PropTypes.number.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default TemplateCard
