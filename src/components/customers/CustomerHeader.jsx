import PropTypes from 'prop-types'
import { Upload, Download, Plus } from 'lucide-react'
import Button from '../Button'

function CustomerHeader({ onImport, onExport, onAddCustomer }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your customer database</p>
      </div>

      <div className="flex flex-wrap gap-3 w-full sm:w-auto">
        <Button 
          variant="secondary" 
          className="flex-1 sm:flex-none justify-center items-center gap-2"
          onClick={onImport}
        >
          <Upload className="w-4 h-4" />
          <span>Import</span>
        </Button>
        
        <Button 
          variant="secondary" 
          className="flex-1 sm:flex-none justify-center items-center gap-2"
          onClick={onExport}
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </Button>
        
        <Button 
          variant="primary" 
          className="flex-1 sm:flex-none justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          onClick={onAddCustomer}
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </Button>
      </div>
    </div>
  )
}

CustomerHeader.propTypes = {
  onImport: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onAddCustomer: PropTypes.func.isRequired,
}

export default CustomerHeader