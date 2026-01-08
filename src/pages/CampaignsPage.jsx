import { useEffect, useState, useMemo } from 'react'
import CampaignHeader from '../components/campaigns/CampaignHeader'
import CampaignTabs from '../components/campaigns/CampaignTabs'
import CampaignCard from '../components/campaigns/CampaignCard'
import CampaignWizard from '../components/campaigns/CampaignWizard'
import ScheduleModal from '../components/campaigns/ScheduleModal'
import Modal from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../services/campaignsService'
import { sendCampaignMessages } from '../services/campaignMessagingService'

function CampaignsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()

  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [editingCampaignId, setEditingCampaignId] = useState(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [campaignToSchedule, setCampaignToSchedule] = useState(null)
  const [viewCustomersCampaign, setViewCustomersCampaign] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch campaigns from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)
        const data = await getCampaigns(user.id)
        setCampaigns(data)
      } catch (error) {
        console.error('Failed to load campaigns:', error)
        toast.error('Failed to load campaigns')
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchData()
    }
  }, [user?.id, authLoading, toast])

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    return {
      all: campaigns.length,
      draft: campaigns.filter((c) => c.status === 'draft').length,
      scheduled: campaigns.filter((c) => c.status === 'scheduled').length,
      active: campaigns.filter((c) => c.status === 'active').length,
      completed: campaigns.filter((c) => c.status === 'completed' || c.status === 'sent').length,
    }
  }, [campaigns])

  // Filter campaigns based on active tab
  const filteredCampaigns = useMemo(() => {
    let list
    if (activeTab === 'all') {
      list = campaigns
    } else if (activeTab === 'completed') {
      list = campaigns.filter((c) => c.status === 'completed' || c.status === 'sent')
    } else {
      list = campaigns.filter((c) => c.status === activeTab)
    }

    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return list

    return list.filter((campaign) => {
      const nameMatch = campaign.name?.toLowerCase().includes(normalizedSearch)
      const idMatch = String(campaign.campaignId || campaign.id || '')
        .toLowerCase()
        .includes(normalizedSearch)
      const messageMatch = campaign.message?.toLowerCase().includes(normalizedSearch)
      return nameMatch || idMatch || messageMatch
    })
  }, [campaigns, activeTab, searchTerm])

  // Tabs configuration
  const tabs = [
    { id: 'all', label: 'All', count: tabCounts.all },
    { id: 'draft', label: 'Drafts', count: tabCounts.draft },
    { id: 'scheduled', label: 'Scheduled', count: tabCounts.scheduled },
    { id: 'active', label: 'Active', count: tabCounts.active },
    { id: 'completed', label: 'Completed', count: tabCounts.completed },
  ]

  // Handle add new campaign
  const handleAddCampaign = () => {
    setEditingCampaignId(null)
    setIsWizardOpen(true)
  }

  const handleEditCampaign = (campaignId) => {
    setEditingCampaignId(campaignId)
    setIsWizardOpen(true)
  }

  const handleOpenScheduleModal = (campaignId) => {
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (!campaign) return

    setCampaignToSchedule(campaign)
    setIsScheduleModalOpen(true)
  }

  const handleScheduleCampaign = async (scheduledDateTime) => {
    if (!user?.id || !campaignToSchedule) return

    try {
      const updatedInput = {
        ...campaignToSchedule,
        status: 'scheduled',
        scheduledFor: scheduledDateTime,
        sentAt: null,
      }

      const updated = await updateCampaign(user.id, campaignToSchedule.id, updatedInput)
      setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      toast.success('Campaign scheduled')
    } catch (error) {
      console.error('Failed to schedule campaign:', error)
      toast.error('Failed to schedule campaign')
    } finally {
      setIsScheduleModalOpen(false)
      setCampaignToSchedule(null)
    }
  }

  const handleStartCampaign = async (campaignId, initialCampaign = null) => {
    if (!user?.id) return

    const campaign = initialCampaign || campaigns.find((c) => c.id === campaignId)
    if (!campaign) return

    try {
      console.log('CampaignsPage: starting campaign', {
        campaignId,
        status: campaign.status,
        customerCount: (campaign.customers || []).length,
        from: initialCampaign ? 'wizard/startNow' : 'card',
      })

      // Optimistically mark as active while backend processes Telnyx sends
      const now = new Date().toISOString()
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, status: 'active', sentAt: now } : c))
      )

      // Trigger backend Edge Function to send messages and track statuses
      await sendCampaignMessages({ ...campaign, sentAt: now })

      // Reload campaigns from Supabase to pick up final stats and status
      const refreshed = await getCampaigns(user.id)
      setCampaigns(refreshed)
      console.log('CampaignsPage: campaign completed and refreshed from Supabase', {
        campaignId,
      })
      toast.success('Campaign completed')
    } catch (error) {
      console.error('Failed to start campaign:', error)
      toast.error('Failed to start campaign')

      // On error, refresh campaigns to reflect the true status from Supabase
      try {
        const refreshed = await getCampaigns(user.id)
        setCampaigns(refreshed)
      } catch (refreshError) {
        console.error('Failed to refresh campaigns after error:', refreshError)
      }
    }
  }

  const handleViewCustomers = (campaignId) => {
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (!campaign) return

    setViewCustomersCampaign(campaign)
  }

  // Handle delete campaign
  const handleDeleteCampaign = async (campaignId) => {
    if (!user?.id) return

    const campaign = campaigns.find((c) => c.id === campaignId)
    if (!campaign) return

    const confirmed = window.confirm(`Delete campaign "${campaign.name}"? This cannot be undone.`)
    if (!confirmed) return

    try {
      await deleteCampaign(user.id, campaignId)
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId))
      toast.success('Campaign deleted')
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      toast.error('Failed to delete campaign')
    }
  }

  // Handle save campaign from wizard
  const handleSaveCampaign = async (campaignData) => {
    if (!user?.id) return

    const { startNow, ...campaignInput } = campaignData || {}

    try {
      let savedCampaign

      if (editingCampaignId) {
        // Update existing campaign
        savedCampaign = await updateCampaign(user.id, editingCampaignId, campaignInput)
        setCampaigns((prev) =>
          prev.map((c) => (c.id === editingCampaignId ? savedCampaign : c))
        )
        toast.success('Campaign updated')
      } else {
        // Create new campaign
        savedCampaign = await createCampaign(user.id, campaignInput)
        setCampaigns((prev) => [savedCampaign, ...prev])
        toast.success('Campaign created')
      }

      setIsWizardOpen(false)
      setEditingCampaignId(null)

      // If user chose "Start Campaign" in the wizard, immediately start it
      if (startNow && savedCampaign?.id) {
        await handleStartCampaign(savedCampaign.id, savedCampaign)
      }
    } catch (error) {
      console.error('Failed to save campaign:', error)
      toast.error('Failed to save campaign')
    }
  }

  // Handle close wizard
  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    setEditingCampaignId(null)
  }

  const isCompletedView =
    viewCustomersCampaign &&
    (viewCustomersCampaign.status === 'completed' || viewCustomersCampaign.status === 'sent')

  const deliveredCustomers = isCompletedView
    ? viewCustomersCampaign.deliveredCustomers || []
    : []

  const allFailedCustomers = isCompletedView ? viewCustomersCampaign.failedCustomers || [] : []

  const uncertainCustomers = isCompletedView
    ? allFailedCustomers.filter((customer) => customer.status === 'uncertain')
    : []

  const failedOnlyCustomers = isCompletedView
    ? allFailedCustomers.filter((customer) => customer.status !== 'uncertain')
    : []

  const formatActualCost = (value) => {
    if (value == null) return null
    const num = Number(value)
    if (Number.isNaN(num)) return String(value)
    const fixed = num.toFixed(6)
    return fixed.replace(/\.?0+$/, '')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <CampaignHeader onAddCampaign={handleAddCampaign} />

      {/* Tabs and Campaign List */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CampaignTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="w-full lg:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaigns..."
              aria-label="Search campaigns"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Campaign Cards Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {activeTab === 'all'
                ? 'No campaigns yet. Create your first campaign to get started!'
                : `No ${activeTab} campaigns.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onDelete={handleDeleteCampaign}
                onEdit={handleEditCampaign}
                onSchedule={handleOpenScheduleModal}
                onStart={handleStartCampaign}
                onViewCustomers={handleViewCustomers}
                showDelete={campaign.status !== 'completed' && campaign.status !== 'sent'}
                allowManagementActions={activeTab !== 'active' && campaign.status !== 'active'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Campaign Wizard Modal */}
      {isWizardOpen && (
        <CampaignWizard
          isOpen={isWizardOpen}
          onClose={handleCloseWizard}
          onSave={handleSaveCampaign}
          campaign={editingCampaignId ? campaigns.find((c) => c.id === editingCampaignId) : null}
        />
      )}

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false)
          setCampaignToSchedule(null)
        }}
        onSchedule={handleScheduleCampaign}
      />

      {viewCustomersCampaign && (
        <Modal
          isOpen
          onClose={() => setViewCustomersCampaign(null)}
          title={isCompletedView ? 'Campaign details' : 'Campaign customers'}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                Campaign: <span className="font-medium text-gray-900">{viewCustomersCampaign.name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Campaign ID:{' '}
                <span className="font-mono text-xs text-gray-800">
                  {viewCustomersCampaign.campaignId || viewCustomersCampaign.id}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Total customers:{' '}
                <span className="font-medium text-gray-900">
                  {(viewCustomersCampaign.customers || []).length}
                </span>
              </p>
              {isCompletedView && (
                <p className="text-sm text-gray-600">
                  Cost:{' '}
                  <span className="font-medium text-gray-900">
                    {viewCustomersCampaign.actualCost != null
                      ? `$${formatActualCost(viewCustomersCampaign.actualCost)}`
                      : 'N/A'}
                  </span>
                  {viewCustomersCampaign.costEstimation != null && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Estimated: ${Number(viewCustomersCampaign.costEstimation).toFixed(2)})
                    </span>
                  )}
                </p>
              )}
            </div>

            {isCompletedView ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Delivered ({deliveredCustomers.length})
                  </h4>
                  {deliveredCustomers.length === 0 ? (
                    <p className="text-sm text-gray-500">No customers were marked as delivered.</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
                      {deliveredCustomers.map((customer) => (
                        <div
                          key={customer.id || customer.phone}
                          className="px-4 py-3 flex justify-between gap-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {customer.name || 'Unnamed customer'}
                            </p>
                            {customer.phone && (
                              <p className="text-xs text-gray-600">{customer.phone}</p>
                            )}
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 self-start">
                            Delivered
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Failed ({failedOnlyCustomers.length})
                  </h4>
                  {failedOnlyCustomers.length === 0 ? (
                    <p className="text-sm text-gray-500">No customers were marked as failed.</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
                      {failedOnlyCustomers.map((customer) => (
                        <div
                          key={customer.id || customer.phone}
                          className="px-4 py-3 flex justify-between gap-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {customer.name || 'Unnamed customer'}
                            </p>
                            {customer.phone && (
                              <p className="text-xs text-gray-600">{customer.phone}</p>
                            )}
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 self-start">
                            Failed
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Uncertain ({uncertainCustomers.length})
                  </h4>
                  {uncertainCustomers.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No customers were marked as uncertain (timeouts).
                    </p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
                      {uncertainCustomers.map((customer) => (
                        <div
                          key={customer.id || customer.phone}
                          className="px-4 py-3 flex justify-between gap-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {customer.name || 'Unnamed customer'}
                            </p>
                            {customer.phone && (
                              <p className="text-xs text-gray-600">{customer.phone}</p>
                            )}
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 self-start">
                            Uncertain
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {(viewCustomersCampaign.customers || []).length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No customers selected for this campaign yet.
                  </p>
                ) : (
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
                    {viewCustomersCampaign.customers.map((customer) => (
                      <div
                        key={customer.id || customer.phone}
                        className="px-4 py-3 flex justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {customer.name || 'Unnamed customer'}
                          </p>
                          {customer.phone && (
                            <p className="text-xs text-gray-600">{customer.phone}</p>
                          )}
                          {customer.email && (
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          )}
                        </div>
                        {customer.status && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 self-start">
                            {customer.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default CampaignsPage
