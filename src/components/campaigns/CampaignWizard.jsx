import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Modal from '../ui/Modal'
import StepIndicator from './StepIndicator'
import CampaignNameStep from './steps/CampaignNameStep'
import AudienceStep from './steps/AudienceStep'
import ReviewStep from './steps/ReviewStep'
import MessageStep from './steps/MessageStep'
import ScheduleModal from './ScheduleModal'
import Button from '../Button'
import { useAuth } from '../../hooks/useAuth'
import { getCustomers } from '../../services/customersService'
import { getTemplates } from '../../services/templatesService'
import { getTags } from '../../services/tagsService'
import { getSettings } from '../../services/settingsService'

function CampaignWizard({ isOpen, onClose, onSave, campaign = null }) {
  const TOTAL_STEPS = 4

  const [currentStep, setCurrentStep] = useState(1)
  const [campaignData, setCampaignData] = useState({
    name: '',
    audienceFilters: {
      customerType: '',
      lastBookingFilter: null,
      tagFilters: {
        includeAny: [],        // Array of tag IDs (numbers) from mockTags
        requireAll: [],        // Array of tag IDs (numbers) from mockTags
        exclude: [],           // Array of tag IDs (numbers) from mockTags
      },
    },
    message: '',
    templateId: null,
    customers: [],
    costEstimation: null,
  })
  const [errors, setErrors] = useState({})
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isStep3Loading, setIsStep3Loading] = useState(false)

  // Data state for real Supabase data
  const [customers, setCustomers] = useState([])
  const [templates, setTemplates] = useState([])
  const [tags, setTags] = useState([])
  const [settings, setSettings] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [dataError, setDataError] = useState(null)

  // Get auth context
  const { user } = useAuth()

  // Initialize with campaign data if editing
  useEffect(() => {
    if (campaign) {
      setCampaignData({
        name: campaign.name || '',
        audienceFilters: campaign.audienceFilters || {
          customerType: '',
          lastBookingFilter: null,
          tagFilters: {
            includeAny: [],        // Array of tag IDs (numbers) from mockTags
            requireAll: [],        // Array of tag IDs (numbers) from mockTags
            exclude: [],           // Array of tag IDs (numbers) from mockTags
          },
        },
        message: campaign.message || '',
        templateId: campaign.templateId || null,
        customers: campaign.customers || [],
        costEstimation: campaign.costEstimation || null,
      })
    } else {
      setCampaignData({
        name: '',
        audienceFilters: {
          customerType: '',
          lastBookingFilter: null,
          tagFilters: {
            includeAny: [],        // Array of tag IDs (numbers) from mockTags
            requireAll: [],        // Array of tag IDs (numbers) from mockTags
            exclude: [],           // Array of tag IDs (numbers) from mockTags
          },
        },
        message: '',
        templateId: null,
        customers: [],
        costEstimation: null,
      })
    }
    setCurrentStep(1)
    setErrors({})
  }, [campaign, isOpen])

  // Fetch all wizard data when modal opens
  useEffect(() => {
    const fetchWizardData = async () => {
      if (!isOpen || !user?.id) return

      setIsDataLoading(true)
      setDataError(null)

      try {
        const [fetchedCustomers, fetchedTemplates, fetchedTags, fetchedSettings] = await Promise.all([
          getCustomers(user.id),
          getTemplates(user.id),
          getTags(user.id),
          getSettings(user.id),
        ])

        setCustomers(fetchedCustomers)
        setTemplates(fetchedTemplates)
        setTags(fetchedTags)
        setSettings(fetchedSettings)
      } catch (error) {
        console.error('Failed to load wizard data:', error)
        setDataError('Failed to load data. Please try again.')
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchWizardData()
  }, [isOpen, user?.id])

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!campaignData.name || campaignData.name.trim().length < 3) {
        newErrors.name = 'Campaign name must be at least 3 characters'
      }
    } else if (step === 2) {
      // Validate audience filters - both fields are required
      if (!campaignData.audienceFilters.customerType ||
          campaignData.audienceFilters.customerType.trim() === '') {
        newErrors.customerType = 'Please select a customer type'
      }
      // lastBookingFilter can be '' (No filter) but not null/undefined (not selected)
      if (campaignData.audienceFilters.lastBookingFilter === null ||
          campaignData.audienceFilters.lastBookingFilter === undefined) {
        newErrors.lastBookingFilter = 'Please select a last booking filter option'
      }
    } else if (step === 4) {
      if (!campaignData.message || campaignData.message.trim().length < 10) {
        newErrors.message = 'Message must be at least 10 characters'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  // Handle back step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle save (different based on step)
  const handleSaveAction = (actionType) => {
    if (!validateStep(currentStep)) return

    const baseCampaign = {
      ...campaignData,
      type: 'one_time',
      recipientIds: [],
      recipientCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      uncertainCount: 0,
      failedCount: 0,
      successRate: 0,
      createdAt: campaign?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
    }

    let campaignToSave = baseCampaign

    if (actionType === 'draft') {
      // Just save as draft, no sending
      campaignToSave = {
        ...baseCampaign,
        status: 'draft',
        scheduledFor: null,
        sentAt: null,
      }
    } else if (actionType === 'send') {
      // Save as active and immediately start the campaign
      campaignToSave = {
        ...baseCampaign,
        status: 'active',
        scheduledFor: null,
        sentAt: null,
        startNow: true,
      }
    }

    onSave(campaignToSave)
    onClose()
  }

  // Handle schedule button click
  const handleScheduleClick = () => {
    if (validateStep(currentStep)) {
      setIsScheduleModalOpen(true)
    }
  }

  // Handle schedule save
  const handleScheduleSave = (scheduledDateTime) => {
    if (validateStep(currentStep)) {
      const campaignToSave = {
        ...campaignData,
        status: 'scheduled',
        type: 'one_time',
        scheduledFor: scheduledDateTime,
        sentAt: null,
        recipientIds: [],
        recipientCount: 0,
        sentCount: 0,
        deliveredCount: 0,
        uncertainCount: 0,
        failedCount: 0,
        successRate: 0,
        createdAt: campaign?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Admin',
      }

      onSave(campaignToSave)
      setIsScheduleModalOpen(false)
      onClose()
    }
  }

  // Get step title
  const getStepTitle = () => {
    const titles = [
      'Campaign Name',
      'Target Audience',
      'Review Audience',
      'Message',
    ]
    return titles[currentStep - 1]
  }

  // Render step content
  const renderStepContent = () => {
    // Show loading state while fetching data
    if (isDataLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading campaign data...</p>
          </div>
        </div>
      )
    }

    // Show error state if data fetch failed
    if (dataError) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{dataError}</p>
            <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <CampaignNameStep
            value={campaignData.name}
            onChange={(name) => {
              setCampaignData({ ...campaignData, name })
              setErrors({ ...errors, name: '' })
            }}
            error={errors.name}
          />
        )
      case 2:
        return (
          <AudienceStep
            audienceFilters={campaignData.audienceFilters}
            onChange={(audienceFilters) => {
              setCampaignData({ ...campaignData, audienceFilters })
              // Clear errors when user makes changes
              setErrors({ ...errors, customerType: '', lastBookingFilter: '' })
            }}
            tags={tags}
            errors={errors}
          />
        )
      case 3:
        return (
          <ReviewStep
            audienceFilters={campaignData.audienceFilters}
            customers={customers}
            tags={tags}
            onLoadingChange={setIsStep3Loading}
            onAudienceCalculated={(matchedCustomers, estimatedCost) => {
              setCampaignData((prev) => ({
                ...prev,
                customers: matchedCustomers,
                costEstimation: estimatedCost,
                recipientIds: matchedCustomers.map((c) => c.id).filter(Boolean),
                recipientCount: matchedCustomers.length,
              }))
            }}
          />
        )
      case 4:
        return (
          <MessageStep
            message={campaignData.message}
            templateId={campaignData.templateId}
            templates={templates}
            defaultSignature={settings?.defaultSignature || ''}
            onMessageChange={(message) => {
              setCampaignData({ ...campaignData, message })
              setErrors({ ...errors, message: '' })
            }}
            onTemplateSelect={(templateId, templateMessage) => {
              setCampaignData({
                ...campaignData,
                templateId,
                message: templateMessage,
              })
            }}
            error={errors.message}
          />
        )
      default:
        return null
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Campaign" size="xl">
      <div className="space-y-3">
        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* Step title */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{getStepTitle()}</h3>
          {currentStep === 2 && (
            <p className="text-sm text-gray-600 mt-1">Define who should receive this campaign</p>
          )}
          {currentStep === 3 && (
            <p className="text-sm text-gray-600 mt-1">Preview who will receive this campaign</p>
          )}
          {currentStep === 4 && (
            <p className="text-sm text-gray-600 mt-1">Choose a template or write your message</p>
          )}
        </div>

        {/* Step content */}
        <div className="min-h-64">{renderStepContent()}</div>

        {/* Navigation buttons */}
        <div className="flex flex-wrap justify-between gap-3 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {currentStep > 1 && (
              <Button variant="secondary" size="sm" onClick={handleBack}>
                ← Back
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            {currentStep < TOTAL_STEPS && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                disabled={(currentStep === 3 && isStep3Loading) || isDataLoading}
              >
                {currentStep === 3 && isStep3Loading ? 'Loading...' : 'Next →'}
              </Button>
            )}

            {currentStep === TOTAL_STEPS && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSaveAction('draft')}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleScheduleClick}
                >
                  Schedule
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSaveAction('send')}
                >
                  Start Campaign
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleScheduleSave}
      />
    </Modal>
  )
}

CampaignWizard.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  campaign: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    message: PropTypes.string,
    templateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    audienceFilters: PropTypes.object,
    createdAt: PropTypes.string,
  }),
}

export default CampaignWizard

