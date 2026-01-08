import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { validateSignupForm } from '../../utils/authValidation'

export function SignupForm() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target

    // Validate single field on blur
    const validation = validateSignupForm(formData)
    if (validation.errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validation.errors[name]
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    const validation = validateSignupForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)

    try {
      await register(formData.name, formData.email, formData.password)
      showToast.success('Account created successfully!')
      navigate('/')
    } catch (error) {
      showToast.error(error.message || 'Signup failed. Please try again.')
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Full Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="John Doe"
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400 text-sm"
            required
          />
        </div>
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="you@example.com"
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400 text-sm"
            required
          />
        </div>
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="At least 6 characters"
            className="w-full pl-12 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400 text-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Re-enter your password"
            className="w-full pl-12 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400 text-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {errors.submit && <p className="text-sm text-red-600 text-center">{errors.submit}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all transform active:scale-[0.98] text-sm"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{' '}
        <Link to="/login" state={{ from: '/signup' }} className="text-blue-600 hover:text-blue-700 font-semibold transition hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}
