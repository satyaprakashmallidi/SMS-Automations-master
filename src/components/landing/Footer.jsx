import { Zap } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-950 text-gray-400 pt-12 pb-8 border-t border-gray-900 font-sans">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
        
        {/* Brand */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <Zap className="w-5 h-5" fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Nudge</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6 text-sm font-medium">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </nav>

        {/* Copyright */}
        <p className="text-xs text-gray-600">
          © {currentYear} Nudge Inc. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
