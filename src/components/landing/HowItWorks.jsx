import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { Upload, Zap, Send, BarChart3 } from 'lucide-react'

const steps = [
  {
    number: 1,
    icon: Upload,
    title: 'Import Contacts',
    description: 'Upload your customer list via CSV or sync directly with your CRM in seconds.'
  },
  {
    number: 2,
    icon: Zap,
    title: 'Create Campaign',
    description: 'Choose from our high-converting templates or build your own custom message flow.'
  },
  {
    number: 3,
    icon: Send,
    title: 'Schedule & Send',
    description: 'Set your timing or define automation triggers based on user behavior.'
  },
  {
    number: 4,
    icon: BarChart3,
    title: 'Track Results',
    description: 'Watch your open rates and conversions climb in real-time with our analytics dashboard.'
  }
]

export function HowItWorks() {
  const navigate = useNavigate()

  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Sticky Header */}
          <div className="lg:sticky lg:top-32">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              From idea to <br/>
              <span className="text-blue-600">sent message</span> <br/>
              in minutes.
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md leading-relaxed">
              Our streamlined workflow removes the friction from SMS marketing. No complex setup, no coding required.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Start Building Now
            </button>
          </div>

          {/* Right Column: Vertical Steps */}
          <div className="relative space-y-12 pb-12"> {/* Removed pl-8 */}
            {/* Vertical Line (Desktop Only) */}
            <div className="hidden lg:block absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative flex items-start gap-4 lg:block group">
                  {/* Number/Icon Bubble */}
                  <div className="flex-shrink-0 bg-white border-2 border-gray-300 w-12 h-12 rounded-full flex items-center justify-center z-10 group-hover:border-blue-300 transition-colors duration-300 relative lg:absolute lg:left-0 lg:top-0 lg:w-16 lg:h-16 lg:border-4 lg:border-gray-50 lg:bg-white">
                    <Icon className="w-5 h-5 text-blue-600 lg:w-6 lg:h-6" />
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-1 lg:pt-2 lg:pl-24">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}

HowItWorks.propTypes = {}
