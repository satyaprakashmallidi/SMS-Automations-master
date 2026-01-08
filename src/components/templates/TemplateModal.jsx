import PropTypes from 'prop-types'
import Modal from '../ui/Modal'
import TemplateForm from './TemplateForm'

function TemplateModal({ isOpen, onClose, template = null, onSave }) {
  const handleSave = async (formData) => {
    const templateData = template
      ? { ...template, ...formData }
      : { id: Date.now(), ...formData }

    await onSave(templateData)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Edit Template' : 'Create New Template'}
      size="md"
    >
      <TemplateForm
        template={template}
        onSave={handleSave}
        onCancel={onClose}
      />
    </Modal>
  )
}

TemplateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  template: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    category: PropTypes.string,
    message: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
  onSave: PropTypes.func.isRequired,
}

export default TemplateModal
