import { useNavigate } from 'react-router-dom'

export function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-gray-900 rounded-[2.5rem] px-6 py-20 md:px-20 md:py-24 text-center shadow-xl relative overflow-hidden border border-gray-800">
          {/* Abstract decorative circle */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-gray-700 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-gray-800 rounded-full opacity-30 blur-3xl"></div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              Ready to transform your <br />
              customer engagement?
            </h2>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of businesses using Nudge to automate campaigns and drive conversions. Start your 14-day free trial today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 text-lg font-bold rounded-full hover:bg-gray-100 transition-all hover:shadow-lg hover:scale-105 active:scale-95"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
