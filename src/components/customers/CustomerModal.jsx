import PropTypes from 'prop-types'
import Modal from '../ui/Modal'
import CustomerForm from './CustomerForm'

function CustomerModal({ isOpen, onClose, customer, onSave, availableTags, loading }) {
  const title = customer ? `Edit Customer - ${customer.name}` : 'Add Customer'

  const handleSave = (formData) => {
    onSave(formData, customer?.id)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <CustomerForm
        customer={customer}
        onSave={handleSave}
        onCancel={onClose}
        availableTags={availableTags}
        loading={loading}
      />
    </Modal>
  )
}

CustomerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customer: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  availableTags: PropTypes.array,
  loading: PropTypes.bool,
}

export default CustomerModal
