import {
  Zap,
  Users,
  FileText,
  Workflow,
  MessageSquare,
  Tag
} from 'lucide-react'

const features = [
  {
    title: 'Smart Campaign Management',
    description: 'Create and schedule targeted SMS campaigns with advanced segmentation. Visualize your reach and optimize for conversion.',
    icon: Zap,
    className: 'md:col-span-4'
  },
  {
    title: 'Automated Workflows',
    description: 'Set up triggers based on customer actions. Let Nudge handle the follow-ups 24/7.',
    icon: Workflow,
    className: 'md:col-span-2'
  },
  {
    title: 'Real-time Inbox',
    description: 'Engage in two-way conversations. Never miss a customer inquiry.',
    icon: MessageSquare,
    className: 'md:col-span-2'
  },
  {
    title: 'Deep Customer Insights',
    description: 'Track behavior, engagement, and ROI with our comprehensive analytics suite. Export data instantly.',
    icon: Users,
    className: 'md:col-span-4'
  },
  {
    title: 'Template Library',
    description: 'Pre-built templates for every industry.',
    icon: FileText,
    className: 'md:col-span-3'
  },
  {
    title: 'Tag-based Automation',
    description: 'Organize contacts with custom tags.',
    icon: Tag,
    className: 'md:col-span-3'
  }
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Everything you need to run <br />
            <span className="text-blue-600">world-class campaigns</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Power up your marketing stack with features designed for speed, reliability, and scale.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`
                  bg-gray-50 rounded-3xl p-8 
                  border border-gray-100 
                  hover:border-gray-200 hover:shadow-sm hover:bg-gray-100/50 
                  transition-all duration-300 
                  flex flex-col justify-between
                  ${feature.className}
                `}
              >
                <div className="mb-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                    <Icon className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
                
                {/* Visual Decorative Element (Abstract) */}
                <div className="mt-4 h-2 w-full bg-gray-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-2/3 rounded-full opacity-20"></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
