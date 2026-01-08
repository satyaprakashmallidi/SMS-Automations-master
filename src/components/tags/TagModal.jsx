import PropTypes from 'prop-types'
import Modal from '../ui/Modal'
import TagForm from './TagForm'

function TagModal({ isOpen, onClose, tag = null, onSave }) {
  const handleSave = (formData) => {
    const tagData = tag
      ? { ...tag, ...formData }
      : { id: Date.now(), ...formData }

    onSave(tagData)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tag ? `Edit Tag - ${tag.name}` : 'Add New Tag'}
      size="lg"
    >
      <TagForm
        tag={tag}
        onSave={handleSave}
        onCancel={onClose}
      />
    </Modal>
  )
}

TagModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tag: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    icon: PropTypes.string,
    color: PropTypes.string,
    definition: PropTypes.string,
    trigger: PropTypes.string,
    type: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
}

export default TagModal
