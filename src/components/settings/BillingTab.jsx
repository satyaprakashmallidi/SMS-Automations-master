import { useState } from 'react'

function BillingTab() {
  const [billingData] = useState({
    plan: 'Professional Plan',
    price: 49,
    credits: 5000,
    creditsUsed: 3247,
  })

  const usagePercentage = (billingData.creditsUsed / billingData.credits) * 100
  const creditsRemaining = billingData.credits - billingData.creditsUsed

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-blue-50 rounded-lg shadow-sm p-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {billingData.plan}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {billingData.credits.toLocaleString()} SMS credits per month
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-3xl font-bold text-blue-600">
              ${billingData.price}
            </p>
            <p className="text-xs text-gray-600 mt-1">per month</p>
          </div>
        </div>
      </div>

      {/* Usage This Month */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Usage This Month
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                SMS Credits Used
              </label>
              <span className="text-sm font-medium text-gray-900">
                {billingData.creditsUsed.toLocaleString()} /{' '}
                {billingData.credits.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600">Credits Used</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {billingData.creditsUsed.toLocaleString()}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-600">Credits Remaining</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {creditsRemaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingTab
