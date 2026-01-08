import PropTypes from 'prop-types'

function CampaignMetrics({ sent, delivered, uncertain, failed, successRate }) {
  return (
    <div className="grid grid-cols-5 gap-4 text-center">
      <div>
        <div className="text-lg font-semibold text-gray-900">{sent}</div>
        <div className="text-sm text-gray-600">Sent</div>
      </div>
      <div>
        <div className="text-lg font-semibold text-green-600">{delivered}</div>
        <div className="text-sm text-gray-600">Delivered</div>
      </div>
      <div>
        <div className="text-lg font-semibold text-yellow-600">{uncertain}</div>
        <div className="text-sm text-gray-600">Uncertain</div>
      </div>
      <div>
        <div className="text-lg font-semibold text-red-600">{failed}</div>
        <div className="text-sm text-gray-600">Failed</div>
      </div>
      <div>
        <div className="text-lg font-semibold text-purple-600">{successRate.toFixed(1)}%</div>
        <div className="text-sm text-gray-600">Success Rate</div>
      </div>
    </div>
  )
}

CampaignMetrics.propTypes = {
  sent: PropTypes.number.isRequired,
  delivered: PropTypes.number.isRequired,
  uncertain: PropTypes.number.isRequired,
  failed: PropTypes.number.isRequired,
  successRate: PropTypes.number.isRequired,
}

export default CampaignMetrics
