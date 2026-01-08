import PropTypes from 'prop-types'
import { Check } from 'lucide-react'

function StepIndicator({ currentStep, totalSteps }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          {/* Step circle */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
              step < currentStep
                ? 'bg-green-600 text-white'
                : step === currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-1 ${
                step < currentStep ? 'bg-green-600' : 'bg-gray-200'
              } transition-colors`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

StepIndicator.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
}

export default StepIndicator
