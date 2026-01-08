import { MessageSquarePlus } from 'lucide-react'

function SMSCreditsWidget() {
  const creditsRemaining = 4250
  const maxCredits = 5000
  const percentage = Math.min((creditsRemaining / maxCredits) * 100, 100)

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-500">Available Credits</p>
          <p className="text-lg font-bold text-gray-900">{creditsRemaining.toLocaleString()}</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <MessageSquarePlus className="w-4 h-4 text-blue-600" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
        <div 
          className="bg-blue-600 h-full rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <button className="w-full py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all hover:shadow-sm">
        Buy Credits
      </button>
    </div>
  )
}

export default SMSCreditsWidget
