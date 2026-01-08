import PropTypes from 'prop-types'
import { useState } from 'react'
import SelectField from '../../ui/SelectField'
import TagFilterSection from '../TagFilterSection'
import {
  customerTypeOptions,
  lastBookingFilterOptions,
} from '../../../data/campaignsData'

function AudienceStep({ audienceFilters, onChange, tags, errors = {} }) {
  const [activeTagTab, setActiveTagTab] = useState('includeAny')

  const handleCustomerTypeChange = (e) => {
    onChange({
      ...audienceFilters,
      customerType: e.target.value,
    })
  }

  const handleLastBookingFilterChange = (e) => {
    onChange({
      ...audienceFilters,
      lastBookingFilter: e.target.value,
    })
  }

  const handleTagToggle = (tagId) => {
    const currentTags = audienceFilters.tagFilters[activeTagTab]
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId]

    onChange({
      ...audienceFilters,
      tagFilters: {
        ...audienceFilters.tagFilters,
        [activeTagTab]: newTags,
      },
    })
  }

  // Use predefined customer type options (SelectField already provides a default "Select an option")
  const customerTypeOptionsWithPlaceholder = customerTypeOptions

  // Modify last booking filter options (no placeholder, starts with "No filter")
  const lastBookingFilterOptionsWithPlaceholder = [
    { value: 'no_filter', label: 'No filter - Include all customers' },
    ...lastBookingFilterOptions.slice(1), // Skip the original "No filter" option
  ]

  // Generate filter logic summary
  const getTagNames = (tagIds) => {
    return tagIds
      .map((id) => tags.find((tag) => tag.id === id)?.name)
      .filter(Boolean)
  }

  const getFilterLogicSummary = () => {
    const { tagFilters } = audienceFilters
    const hasIncludeAny = tagFilters.includeAny.length > 0
    const hasRequireAll = tagFilters.requireAll.length > 0
    const hasExclude = tagFilters.exclude.length > 0

    if (!hasIncludeAny && !hasRequireAll && !hasExclude) {
      return 'No tag filters applied - all customers match'
    }

    const parts = []

    if (hasIncludeAny) {
      const names = getTagNames(tagFilters.includeAny)
      parts.push(`Send to customers with ${names.join(' OR ')} tags`)
    }

    if (hasRequireAll) {
      const names = getTagNames(tagFilters.requireAll)
      const prefix = hasIncludeAny ? ', AND' : 'Send to customers with'
      parts.push(`${prefix} ${names.join(' AND ')} tags`)
    }

    if (hasExclude) {
      const names = getTagNames(tagFilters.exclude)
      const prefix = hasIncludeAny || hasRequireAll ? ', excluding' : 'Excluding'
      parts.push(`${prefix} ${names.join(', ')}`)
    }

    return parts.join('')
  }

  return (
    <div className="space-y-6">
      {/* Customer Type */}
      <div>
        <SelectField
          name="customerType"
          label="Customer Type"
          value={audienceFilters.customerType || ''}
          onChange={handleCustomerTypeChange}
          options={customerTypeOptionsWithPlaceholder}
          error={errors.customerType}
          required
        />
      </div>

      {/* Last Booking Filter */}
      <div>
        <SelectField
          name="lastBookingFilter"
          label="Last Booking Filter"
          value={audienceFilters.lastBookingFilter === null ? '' : audienceFilters.lastBookingFilter}
          onChange={handleLastBookingFilterChange}
          options={lastBookingFilterOptionsWithPlaceholder}
          error={errors.lastBookingFilter}
          required
        />
      </div>

      {/* Tag Filters */}
      <TagFilterSection
        tags={tags}
        activeTab={activeTagTab}
        onTabChange={setActiveTagTab}
        tagFilters={audienceFilters.tagFilters}
        onTagToggle={handleTagToggle}
      />

      {/* Filter Logic Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">{getFilterLogicSummary()}</p>
      </div>
    </div>
  )
}

AudienceStep.propTypes = {
  audienceFilters: PropTypes.shape({
    customerType: PropTypes.string.isRequired,
    lastBookingFilter: PropTypes.string,
    tagFilters: PropTypes.shape({
      includeAny: PropTypes.arrayOf(PropTypes.number),
      requireAll: PropTypes.arrayOf(PropTypes.number),
      exclude: PropTypes.arrayOf(PropTypes.number),
    }).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.object).isRequired,
  errors: PropTypes.object,
}

export default AudienceStep
