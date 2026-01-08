import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { validateLoginForm } from '../../utils/authValidation'

export function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    const validation = validateLoginForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)

    try {
      await login(formData.email, formData.password)
      showToast.success('Logged in successfully!')
      navigate('/')
    } catch (error) {
      showToast.error(error.message || 'Login failed. Please try again.')
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
            placeholder="Enter your password"
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

      {/* Remember Me */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 cursor-pointer font-medium">
            Remember me
          </label>
        </div>
        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Forgot password?
        </a>
      </div>

      {errors.submit && <p className="text-sm text-red-600 text-center">{errors.submit}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all transform active:scale-[0.98] text-sm"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      {/* Signup Link */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition hover:underline">
          Sign up for free
        </Link>
      </p>
    </form>
  )
}
