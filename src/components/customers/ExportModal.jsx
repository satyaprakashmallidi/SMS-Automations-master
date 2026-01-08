import PropTypes from 'prop-types'
import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../Button'

function ExportModal({ isOpen, onClose, onExport, loading }) {
  const [format, setFormat] = useState('csv')

  const handleExport = () => {
    onExport(format)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Customers" size="sm">
      <div className="space-y-4">
        {/* Format Selection */}
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="format"
              value="csv"
              checked={format === 'csv'}
              onChange={(e) => setFormat(e.target.value)}
              disabled={loading}
              className="mr-3"
            />
            <span className="text-sm font-medium text-gray-900">CSV Format (.csv)</span>
          </label>
          <p className="text-xs text-gray-500 ml-6">Excel, Google Sheets compatible</p>

        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

ExportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default ExportModal
