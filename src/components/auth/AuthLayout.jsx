import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Zap } from 'lucide-react'

export function AuthLayout({ children, title, subtitle }) {
  const navigate = useNavigate()

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white">
      {/* Left Side - Brand/Image (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-lg">
              <Zap className="w-6 h-6" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Nudge</span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Scale your outreach, <br />
            <span className="text-blue-400">not your workload.</span>
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-sm leading-relaxed">
            Experience the reliability and speed of a global SMS infrastructure designed for modern growth teams.
          </p>
          <div className="flex gap-8 border-t border-gray-800 pt-8">
            <div>
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-sm text-gray-400 mt-1">Open Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">10k+</p>
              <p className="text-sm text-gray-400 mt-1">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-sm text-gray-400 mt-1">Support</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-gray-500">
          © 2025 Nudge Inc.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-white">
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => navigate('/landing')}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-md mx-auto py-6">
            <div className="mb-6">
              <div className="flex lg:hidden items-center gap-2 mb-4 justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                  <Zap className="w-5 h-5" fill="currentColor" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">Nudge</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center lg:text-left">{title}</h2>
              <p className="text-sm md:text-base text-gray-500 text-center lg:text-left">{subtitle}</p>
            </div>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string
}
