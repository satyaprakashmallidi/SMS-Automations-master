import PropTypes from 'prop-types'
import { CheckCircle } from 'lucide-react'

const content = {
  login: {
    headline: 'Welcome back',
    subheadline: 'Continue managing campaigns',
    bullets: [
      'All campaigns in one place',
      'Real-time engagement',
      'Analytics & insights'
    ]
  },
  signup: {
    headline: 'Get started today',
    subheadline: 'Join thousands automating SMS',
    bullets: [
      'Free forever plan',
      'Enterprise security',
      'No card required'
    ]
  }
}

export function BrandPanel({ mode = 'login' }) {
  const { headline, subheadline, bullets } = content[mode] || content.login

  return (
    <div className="w-full bg-gradient-to-br from-blue-600 to-blue-700 p-8 flex flex-col justify-center items-center text-center text-white">
      <div className="max-w-lg">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Nudge</h1>
          </div>
          <p className="text-blue-100 text-sm">SMS Automation Platform</p>
        </div>

        {/* Headline */}
        <h2 className="text-4xl font-bold mb-4 leading-tight">
          {headline}
        </h2>

        {/* Subheadline */}
        <p className="text-blue-100 text-base mb-8 leading-relaxed">
          {subheadline}
        </p>

        {/* Bullet Points */}
        <div className="space-y-3 flex flex-col items-center">
          {bullets.map((bullet, index) => (
            <div key={index} className="flex items-center gap-3 justify-center">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-blue-200" />
              <span className="text-base text-white font-medium">{bullet}</span>
            </div>
          ))}
        </div>

        {/* Footer Text */}
        <div className="mt-12 pt-6 border-t border-blue-500 border-opacity-30">
          <p className="text-blue-100 text-xs">
            Trusted by thousands worldwide
          </p>
        </div>
      </div>
    </div>
  )
}

BrandPanel.propTypes = {
  mode: PropTypes.oneOf(['login', 'signup'])
}
