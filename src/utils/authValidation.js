// Email validation
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export function validatePassword(password) {
  const errors = []

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Full name validation
export function validateFullName(name) {
  if (!name || name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters'
    }
  }

  return { isValid: true }
}

// Login form validation
export function validateLoginForm(formData) {
  const errors = {}

  if (!formData.email) {
    errors.email = 'Email is required'
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email format'
  }

  if (!formData.password) {
    errors.password = 'Password is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Signup form validation
export function validateSignupForm(formData) {
  const errors = {}

  // Name validation
  const nameValidation = validateFullName(formData.name)
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error
  }

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required'
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email format'
  }

  // Password validation
  const passwordValidation = validatePassword(formData.password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0] // Show first error
  }

  // Confirm password
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
