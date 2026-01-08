import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'
import InputField from '../../ui/InputField'

function CampaignNameStep({ value, onChange, error = '' }) {
  const inputRef = useRef(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="space-y-4">
      <p className="text-gray-600">Give your campaign a descriptive name</p>
      <InputField
        ref={inputRef}
        name="campaignName"
        label="Campaign Name"
        placeholder="e.g., VIP Winter Promotion"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        required
      />
      <p className="text-xs text-gray-500">
        {value.length} / 100 characters
      </p>
    </div>
  )
}

CampaignNameStep.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
}

export default CampaignNameStep
