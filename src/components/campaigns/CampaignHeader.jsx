import PropTypes from 'prop-types'
import { Plus } from 'lucide-react'
import Button from '../Button'

function CampaignHeader({ onAddCampaign }) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">SMS Campaigns</h1>
        <p className="text-gray-600 mt-2">Create and manage your SMS marketing campaigns</p>
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={onAddCampaign}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        New Campaign
      </Button>
    </div>
  )
}

CampaignHeader.propTypes = {
  onAddCampaign: PropTypes.func.isRequired,
}

export default CampaignHeader
