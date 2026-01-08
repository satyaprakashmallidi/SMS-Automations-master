import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import CustomerHeader from '../components/customers/CustomerHeader'
import CustomerFilters from '../components/customers/CustomerFilters'
import CustomerTable from '../components/customers/CustomerTable'
import CustomerModal from '../components/customers/CustomerModal'
import ImportModal from '../components/customers/ImportModal'
import ExportModal from '../components/customers/ExportModal'
import Modal from '../components/ui/Modal'
import Button from '../components/Button'
import { getTags } from '../services/tagsService'
import { getCustomers, saveCustomers } from '../services/customersService'
import { ensureCustomerConversations, deleteCustomerConversations } from '../services/conversationsService'
import {
  parseCSV,
  transformToCustomers,
  exportToCSV,
  validateFileType,
  downloadFile,
} from '../utils/fileHandlers'

function CustomersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const showToast = useToast()

  // Data State
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [availableTags, setAvailableTags] = useState([])

  // Modal States
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [customerToDelete, setCustomerToDelete] = useState(null)

  // Loading States
  const [customerLoading, setCustomerLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])

  // Sort States
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          const [tags, fetchedCustomers] = await Promise.all([
            getTags(user.id),
            getCustomers(user.id)
          ])
          setAvailableTags(tags)
          setCustomers(fetchedCustomers)
        } catch (error) {
          console.error('Failed to load data:', error)
          showToast.error('Failed to load data')
        }
      }
    }
    
    if (!authLoading) {
      fetchData()
    }
  }, [user?.id, authLoading, showToast])

  // Calculate counts
  const getTabCounts = () => ({
    all: customers.length,
    recurring: customers.filter((c) => c.type === 'Recurring').length,
    residential: customers.filter((c) => c.type === 'Residential').length,
    optedOut: customers.filter((c) => c.type === 'Opted Out').length,
    inactive: customers.filter((c) => c.status === 'inactive').length,
  })

  // Filter and Sort Effect
  useEffect(() => {
    let result = [...customers]

    // 1. Tab Filter
    if (activeTab === 'recurring') result = result.filter((c) => c.type === 'Recurring')
    else if (activeTab === 'residential') result = result.filter((c) => c.type === 'Residential')
    else if (activeTab === 'optedOut') result = result.filter((c) => c.type === 'Opted Out')
    else if (activeTab === 'inactive') result = result.filter((c) => c.status === 'inactive')

    // 2. Tag Filter (OR logic)
    if (selectedTags.length > 0) {
      result = result.filter((customer) =>
        customer.tags && customer.tags.some((tagId) => selectedTags.includes(tagId))
      )
    }

    // 3. Search Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      result = result.filter((c) =>
        c.name.toLowerCase().includes(lowerTerm) ||
        c.email?.toLowerCase().includes(lowerTerm) ||
        c.phone?.includes(lowerTerm) ||
        c.address?.toLowerCase().includes(lowerTerm)
      )
    }

    // 4. Sorting
    result.sort((a, b) => {
      let aVal = a[sortColumn]
      let bVal = b[sortColumn]

      if (sortColumn === 'totalSpent') {
        aVal = parseFloat(aVal || 0)
        bVal = parseFloat(bVal || 0)
      } else if (sortColumn === 'lastService') {
        aVal = aVal ? new Date(aVal).getTime() : 0
        bVal = bVal ? new Date(bVal).getTime() : 0
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredCustomers(result)
  }, [customers, searchTerm, activeTab, sortColumn, sortDirection, selectedTags])

  // Handlers
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleDeleteCustomer = (customerId) => {
    setCustomerToDelete(customerId)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!customerToDelete) return

    setCustomerLoading(true)
    try {
      const updatedCustomers = customers.filter((c) => c.id !== customerToDelete)
      setCustomers(updatedCustomers)
      await saveCustomers(user.id, updatedCustomers)
      await deleteCustomerConversations(user.id, [customerToDelete])
      showToast.success('Customer deleted successfully')
      setIsDeleteModalOpen(false)
      setCustomerToDelete(null)
    } catch (error) {
      console.error('Failed to delete customer:', error)
      showToast.error('Failed to delete customer')
      // Revert on error
      const refetched = await getCustomers(user.id)
      setCustomers(refetched)
    } finally {
      setCustomerLoading(false)
    }
  }

  const handleSaveCustomer = async (formData, customerId) => {
    setCustomerLoading(true)
    try {
      let updatedCustomers
      const timestamp = new Date().toISOString().split('T')[0]

      if (customerId) {
        updatedCustomers = customers.map((c) =>
          c.id === customerId ? { ...formData, id: c.id, createdAt: c.createdAt, updatedAt: timestamp } : c
        )
        showToast.success('Customer updated')
      } else {
        updatedCustomers = [{ ...formData, id: Date.now(), createdAt: timestamp, updatedAt: timestamp }, ...customers]
        showToast.success('Customer added')
      }

      setCustomers(updatedCustomers)
      await saveCustomers(user.id, updatedCustomers)
      await ensureCustomerConversations(user.id, updatedCustomers)
      setIsCustomerModalOpen(false)
      setEditingCustomer(null)
    } catch (error) {
      console.error('Failed to save:', error)
      showToast.error('Failed to save customer')
      const refetched = await getCustomers(user.id)
      setCustomers(refetched)
    } finally {
      setCustomerLoading(false)
    }
  }

  const handleImport = async (file) => {
    setImportLoading(true)
    try {
      if (!validateFileType(file)) throw new Error('Invalid file type. Use CSV.')
      
      const parsed = await parseCSV(file)
      const newCustomers = transformToCustomers(parsed).map(c => ({
        ...c,
        id: Date.now() + Math.random(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }))

      const updated = [...newCustomers, ...customers]
      setCustomers(updated)
      await saveCustomers(user.id, updated)
      await ensureCustomerConversations(user.id, updated)
      
      showToast.success(`${newCustomers.length} customers imported`)
      setIsImportModalOpen(false)
    } catch (error) {
      showToast.error(error.message)
    } finally {
      setImportLoading(false)
    }
  }

  const handleExport = (format) => {
    if (format !== 'csv') return showToast.error('Only CSV export is currently supported')
    
    setExportLoading(true)
    try {
      const csv = exportToCSV(filteredCustomers)
      downloadFile(csv, `customers_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
      showToast.success('Export successful')
      setIsExportModalOpen(false)
    } catch (error) {
      showToast.error('Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <CustomerHeader
        onImport={() => setIsImportModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
        onAddCustomer={() => {
          setEditingCustomer(null)
          setIsCustomerModalOpen(true)
        }}
      />

      <div className="flex flex-col shadow-sm rounded-xl bg-white border border-gray-200">
        <CustomerFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabCounts={getTabCounts()}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          availableTags={availableTags}
        />

        <CustomerTable
          customers={filteredCustomers}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          onEdit={(c) => {
            setEditingCustomer(c)
            setIsCustomerModalOpen(true)
          }}
          onDelete={handleDeleteCustomer}
          availableTags={availableTags}
        />
      </div>

      {/* Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
        availableTags={availableTags}
        loading={customerLoading}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        loading={importLoading}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        loading={exportLoading}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Customer"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this customer? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={customerLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={customerLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CustomersPage
