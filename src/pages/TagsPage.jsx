import { useState, useEffect } from 'react'
import TagHeader from '../components/tags/TagHeader'
import TagTable from '../components/tags/TagTable'
import TagModal from '../components/tags/TagModal'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { getTags, saveTags } from '../services/tagsService'
import { getCustomers, saveCustomers } from '../services/customersService'
import { autoApplyTagToCustomers } from '../utils/autoTagging'

function TagsPage() {
  const { user } = useAuth()
  const toast = useToast()

  // Data state
  const [tags, setTags] = useState([])
  const [filteredTags, setFilteredTags] = useState([])
  const [customers, setCustomers] = useState([])

  // Modal state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState(null)

  // Sort state
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  // Loading state
  const [isLoading, setIsLoading] = useState(true)
  const [isAutoApplyingAll, setIsAutoApplyingAll] = useState(false)

  // Fetch tags/customers from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return
      setIsLoading(true)
      try {
        const [fetchedTags, fetchedCustomers] = await Promise.all([
          getTags(user.id),
          getCustomers(user.id),
        ])
        setTags(fetchedTags)
        setCustomers(fetchedCustomers)
      } catch (error) {
        console.error('Error fetching tags/customers:', error)
        setTags([])
        setCustomers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  // Filter and sort effect
  useEffect(() => {
    let result = [...tags]

    // Apply sorting
    result.sort((a, b) => {
      let aVal = a[sortColumn]
      let bVal = b[sortColumn]

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredTags(result)
  }, [tags, sortColumn, sortDirection])

  // Handle add tag
  const handleAddTag = () => {
    setEditingTag(null)
    setIsTagModalOpen(true)
  }

  // Handle edit tag
  const handleEditTag = (tag) => {
    setEditingTag(tag)
    setIsTagModalOpen(true)
  }

  // Handle close modal
  const handleCloseModal = () => {
    setIsTagModalOpen(false)
    setEditingTag(null)
  }

  // Handle save tag
  const handleSaveTag = async (formData) => {
    try {
      if (!user?.id) {
        console.error('User not authenticated')
        return
      }

      let updatedTags
      if (editingTag) {
        // Update existing tag
        updatedTags = tags.map((t) =>
          t.id === editingTag.id ? { ...formData, id: t.id } : t
        )
        console.log('Tag updated:', formData.name)
      } else {
        // Add new tag
        const newTag = {
          ...formData,
          id: Date.now(),
        }
        updatedTags = [...tags, newTag]
        console.log('Tag created:', newTag.name)
      }

      // Update local state (optimistic UI)
      setTags(updatedTags)

      // Save to Supabase
      await saveTags(user.id, updatedTags)
    } catch (error) {
      console.error('Error saving tag:', error)
      // Revert local state on error
      setTags(tags)
    }

    handleCloseModal()
  }

  // Handle delete tag
  const handleDeleteTag = async (id) => {
    const tag = tags.find((t) => t.id === id)
    const confirmed = window.confirm(
      `Delete tag "${tag.name}"? This cannot be undone.`
    )

    if (!confirmed) return

    try {
      if (!user?.id) {
        console.error('User not authenticated')
        return
      }

      // Calculate updated tags array
      const updatedTags = tags.filter((t) => t.id !== id)

      // Update local state (optimistic UI)
      setTags(updatedTags)

      // Save to Supabase
      await saveTags(user.id, updatedTags)

      console.log('Tag deleted:', tag.name)
    } catch (error) {
      console.error('Error deleting tag:', error)
      // Revert local state on error
      setTags(tags)
    }
  }

  const handleAutoApplyAll = async () => {
    if (!user?.id) {
      console.error('User not authenticated')
      return
    }

    if (tags.length === 0) {
      toast.info('No tags available yet.')
      return
    }

    if (customers.length === 0) {
      toast.info('No customers available to evaluate yet.')
      return
    }

    const autoTags = tags.filter((tag) => tag.type === 'auto')
    if (autoTags.length === 0) {
      toast.info('Create at least one auto tag to use auto-apply.')
      return
    }

    const confirmed = window.confirm(
      `Auto-apply ${autoTags.length} auto tag${autoTags.length === 1 ? '' : 's'} across all customers?`
    )
    if (!confirmed) return

    const previousCustomers = customers
    setIsAutoApplyingAll(true)
    try {
      let updatedCustomers = customers
      let totalMatched = 0
      let totalApplied = 0
      let tagsWithMatches = 0

      autoTags.forEach((tag) => {
        const { updatedCustomers: nextCustomers, matchedCount, appliedCount } =
          autoApplyTagToCustomers(tag, updatedCustomers)

        updatedCustomers = nextCustomers
        if (matchedCount > 0) {
          tagsWithMatches += 1
          totalMatched += matchedCount
        }
        if (appliedCount > 0) {
          totalApplied += appliedCount
        }
      })

      if (totalMatched === 0) {
        toast.info('No customers matched any auto tag triggers.')
        return
      }

      if (totalApplied === 0) {
        toast.info('All matching customers already have the correct tags applied.')
        return
      }

      setCustomers(updatedCustomers)
      await saveCustomers(user.id, updatedCustomers)

      toast.success(
        `Auto-applied tags to ${totalApplied} customer${totalApplied === 1 ? '' : 's'} across ${tagsWithMatches} trigger${tagsWithMatches === 1 ? '' : 's'}.`
      )
    } catch (error) {
      console.error('Failed to auto-apply tags:', error)
      setCustomers(previousCustomers)
      toast.error('Failed to auto-apply tags')
    } finally {
      setIsAutoApplyingAll(false)
    }
  }

  // Handle sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading tags...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <TagHeader
        onAddTag={handleAddTag}
        onAutoApplyAll={handleAutoApplyAll}
        isAutoApplyingAll={isAutoApplyingAll}
      />

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredTags.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No tags found.</p>
          </div>
        ) : (
          <TagTable
            tags={filteredTags}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onEdit={handleEditTag}
            onDelete={handleDeleteTag}
          />
        )}
      </div>

      {/* Modals */}
      <TagModal
        isOpen={isTagModalOpen}
        onClose={handleCloseModal}
        tag={editingTag}
        onSave={handleSaveTag}
      />
    </div>
  )
}

export default TagsPage
