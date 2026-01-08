import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-100/50 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-100/50 rounded-full blur-3xl opacity-50 mix-blend-multiply translate-y-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-sm font-medium text-gray-600">New: Advanced SMS Automation</span>
          <ArrowRight className="w-3 h-3 text-gray-400" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6 leading-[1.1] max-w-4xl mx-auto animate-fade-in-up delay-100">
          The Operating System for <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            SMS Marketing
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
          Engage customers, automate workflows, and drive revenue with the most intuitive SMS platform built for modern growth teams.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up delay-300">
          <button
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white text-lg font-semibold rounded-full transition-all hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const howItWorksSection = document.getElementById('how-it-works')
              if (howItWorksSection) {
                howItWorksSection.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-lg font-semibold rounded-full transition-all flex items-center justify-center gap-2"
          >
            View Demo
          </button>
        </div>

        {/* Trust Text */}
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-16 animate-fade-in-up delay-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>No credit card required</span>
          </div>
        </div>

        {/* Hero Image / Dashboard Mockup */}
        <div className="relative mx-auto max-w-5xl animate-fade-in-up delay-500">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white">
            {/* Chrome */}
            <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  app.nudge.com
                </div>
              </div>
            </div>
            {/* Image Placeholder - using abstract UI representation */}
            <div className="bg-white p-2 sm:p-4">
               {/* We can simulate a UI here or just use a placeholder block if we don't have an image asset. 
                   I'll build a CSS-only UI representation. */}
               <div className="grid grid-cols-4 gap-4 h-[300px] md:h-[500px]">
                  {/* Sidebar */}
                  <div className="hidden md:block col-span-1 bg-gray-50 rounded-lg border border-gray-100 p-4 space-y-3">
                    <div className="h-8 w-3/4 bg-gray-200 rounded mb-6"></div>
                    <div className="h-4 w-full bg-blue-100 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                    <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </div>
                  {/* Main Content */}
                  <div className="col-span-4 md:col-span-3 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between">
                      <div className="h-8 w-32 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-blue-600 rounded-full"></div>
                    </div>
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 rounded-xl bg-blue-50 border border-blue-100"></div>
                      <div className="h-24 rounded-xl bg-purple-50 border border-purple-100"></div>
                      <div className="h-24 rounded-xl bg-green-50 border border-green-100"></div>
                    </div>
                    {/* Chart */}
                    <div className="h-48 rounded-xl bg-gray-50 border border-gray-100 relative overflow-hidden flex items-end px-4 pb-0 gap-2">
                       {[40, 70, 55, 85, 60, 90, 75, 50, 65, 80, 95, 60].map((h, i) => (
                         <div key={i} className="flex-1 bg-gradient-to-t from-blue-500/20 to-blue-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
                       ))}
                    </div>
                    {/* List */}
                    <div className="space-y-2">
                      <div className="h-12 rounded-lg border border-gray-100 bg-white shadow-sm"></div>
                      <div className="h-12 rounded-lg border border-gray-100 bg-white shadow-sm"></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
