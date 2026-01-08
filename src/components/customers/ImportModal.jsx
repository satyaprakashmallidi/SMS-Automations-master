import PropTypes from 'prop-types'
import { useState } from 'react'
import { Upload } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../Button'
import { REQUIRED_COLUMNS } from '../../utils/fileHandlers'

function ImportModal({ isOpen, onClose, onImport, loading }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleImport = () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    onImport(file)
    setFile(null)
    setError(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
      setError(null)
    }
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Customers" size="sm">
      <div className="space-y-3">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
          <p className="font-semibold text-blue-900 mb-1">Required columns:</p>
          <div className="text-blue-800 grid grid-cols-2 gap-1">
            {REQUIRED_COLUMNS.map((col) => (
              <div key={col} className="text-xs">✓ {col}</div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-blue-700 text-xs">CSV or Excel format only</p>
            <a
              href="/demo-customer-import.csv"
              download
              className="text-xs font-medium text-blue-700 hover:text-blue-900 underline"
            >
              Download demo CSV
            </a>
          </div>
        </div>

        {/* File Upload */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:border-gray-400 transition-colors"
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-600 font-medium mb-1">Drag file or</p>
          <label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading}
            />
            <span className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium cursor-pointer hover:bg-blue-700 inline-block">
              Select
            </span>
          </label>
        </div>

        {/* Selected File */}
        {file && (
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <p className="text-xs text-green-800">
              ✓ {file.name}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

ImportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default ImportModal
