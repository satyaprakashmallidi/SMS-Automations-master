import { useState, useEffect } from 'react'
import TemplateHeader from '../components/templates/TemplateHeader'
import TemplateFilters from '../components/templates/TemplateFilters'
import TemplateGrid from '../components/templates/TemplateGrid'
import TemplateEmptyState from '../components/templates/TemplateEmptyState'
import TemplateModal from '../components/templates/TemplateModal'
import { useAuth } from '../hooks/useAuth'
import { getTemplates, saveTemplates } from '../services/templatesService'

function TemplatesPage() {
  const { user } = useAuth()

  // Data state
  const [templates, setTemplates] = useState([])
  const [filteredTemplates, setFilteredTemplates] = useState([])

  // Loading state
  const [isLoading, setIsLoading] = useState(true)

  // Modal state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Fetch templates from Supabase on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        if (!user?.id) return
        setIsLoading(true)
        const fetchedTemplates = await getTemplates(user.id)
        setTemplates(fetchedTemplates)
      } catch (error) {
        console.error('Error fetching templates:', error)
        // Fallback to empty array on error
        setTemplates([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [user?.id])

  // Filtering logic
  useEffect(() => {
    let result = [...templates]

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter)
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.message.toLowerCase().includes(searchLower) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }

    setFilteredTemplates(result)
  }, [templates, searchTerm, categoryFilter])

  // Handle create/edit template modal
  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setIsTemplateModalOpen(true)
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setIsTemplateModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsTemplateModalOpen(false)
    setEditingTemplate(null)
  }

  // Handle save template
  const handleSaveTemplate = async (formData) => {
    try {
      if (!user?.id) {
        console.error('User not authenticated')
        return
      }

      let updatedTemplates
      if (editingTemplate) {
        // Update existing template
        updatedTemplates = templates.map((t) =>
          t.id === editingTemplate.id ? { ...formData, id: t.id } : t
        )
        console.log('Template updated:', formData.name)
      } else {
        // Add new template
        updatedTemplates = [...templates, formData]
        console.log('Template created:', formData.name)
      }

      // Update local state (optimistic UI)
      setTemplates(updatedTemplates)

      // Save to Supabase
      await saveTemplates(user.id, updatedTemplates)
    } catch (error) {
      console.error('Error saving template:', error)
      // Revert local state on error
      setTemplates(templates)
    }

    handleCloseModal()
  }

  // Handle delete template
  const handleDeleteTemplate = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this template?')
    if (!confirmed) return

    try {
      if (!user?.id) {
        console.error('User not authenticated')
        return
      }

      // Calculate updated templates array
      const updatedTemplates = templates.filter((t) => t.id !== id)

      // Update local state (optimistic UI)
      setTemplates(updatedTemplates)

      // Save to Supabase
      await saveTemplates(user.id, updatedTemplates)

      console.log('Template deleted')
    } catch (error) {
      console.error('Error deleting template:', error)
      // Revert local state on error
      setTemplates(templates)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading templates...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <TemplateHeader onNewTemplate={handleCreateTemplate} />

      {/* Filters */}
      <TemplateFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        templateCount={filteredTemplates.length}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {filteredTemplates.length === 0 ? (
          <TemplateEmptyState onCreateTemplate={handleCreateTemplate} />
        ) : (
          <TemplateGrid
            templates={filteredTemplates}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
          />
        )}
      </div>

      {/* Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={handleCloseModal}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  )
}

export default TemplatesPage
