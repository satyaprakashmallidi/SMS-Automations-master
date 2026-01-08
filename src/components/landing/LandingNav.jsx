import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'

export function LandingNav() {
  const navigate = useNavigate()

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-5xl bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-full shadow-lg shadow-gray-200/20 transition-all duration-300">
        <div className="px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Zap className="w-5 h-5" fill="currentColor" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight hidden sm:block">Nudge</span>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Pricing</a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all hover:shadow-md hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
