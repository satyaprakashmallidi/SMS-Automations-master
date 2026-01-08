export function ProductShowcase() {
  const features = [
    {
      title: 'Campaign Dashboard',
      description: 'View all your campaigns in one place with real-time status updates'
    },
    {
      title: 'Message Composer',
      description: 'Drag-and-drop interface with pre-built templates for quick setup'
    },
    {
      title: 'Customer Inbox',
      description: 'Manage two-way conversations with your customers seamlessly'
    },
    {
      title: 'Analytics Suite',
      description: 'Deep insights into performance metrics and customer engagement'
    },
    {
      title: 'Automation Workflows',
      description: 'Set up powerful triggers and automation rules without coding'
    },
    {
      title: 'API Integration',
      description: 'Connect with your favorite tools via our robust API'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to run successful SMS campaigns at scale
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-200 transition-all duration-300 group cursor-pointer"
            >
              {/* Icon Placeholder */}
              <div className="w-12 h-12 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors mb-4" />

              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Learn More Link */}
              <div className="mt-4 pt-4 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                  Learn more →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Mockup */}
        <div className="mt-16">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
            {/* Browser Chrome */}
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-400">
                app.nudge.com/campaigns
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="aspect-video bg-gradient-to-br from-gray-50 to-white p-8 space-y-6">
              {/* Header with buttons */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  + New Campaign
                </button>
              </div>

              {/* Campaign List */}
              <div className="space-y-3">
                {[
                  { name: 'Summer Promotion', sent: '2,345', open: '68%', click: '23%' },
                  { name: 'Flash Sale 48hr', sent: '1,890', open: '75%', click: '31%' },
                  { name: 'Weekly Newsletter', sent: '5,123', open: '52%', click: '18%' }
                ].map((campaign, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{campaign.name}</p>
                      <p className="text-sm text-gray-500">Sent: {campaign.sent}</p>
                    </div>
                    <div className="flex gap-6 text-center">
                      <div>
                        <p className="text-lg font-semibold text-green-600">{campaign.open}</p>
                        <p className="text-xs text-gray-500">Open Rate</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-blue-600">{campaign.click}</p>
                        <p className="text-xs text-gray-500">Click Rate</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">12.5K</p>
                  <p className="text-xs text-gray-600 mt-1">Total Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">65%</p>
                  <p className="text-xs text-gray-600 mt-1">Avg Open</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">24%</p>
                  <p className="text-xs text-gray-600 mt-1">Avg Click</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
