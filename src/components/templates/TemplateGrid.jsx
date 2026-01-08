import PropTypes from 'prop-types'
import TemplateCard from './TemplateCard'

function TemplateGrid({ templates, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

TemplateGrid.propTypes = {
  templates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string),
      characterCount: PropTypes.number.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default TemplateGrid
