export function validateCustomerForm(formData) {
  const errors = {}

  // Name validation
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Name is required'
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  // Phone validation
  if (!formData.phone || formData.phone.trim() === '') {
    errors.phone = 'Phone is required'
  } else {
    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      errors.phone = 'Phone must be at least 10 digits'
    }
  }

  // Email validation
  if (!formData.email || formData.email.trim() === '') {
    errors.email = 'Email is required'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format'
    }
  }

  // Status validation
  if (!formData.status) {
    errors.status = 'Status is required'
  }

  // Type validation
  if (!formData.type) {
    errors.type = 'Type is required'
  }

  // Last Service date validation (optional but must be valid if provided)
  if (formData.lastService) {
    const date = new Date(formData.lastService)
    if (isNaN(date.getTime())) {
      errors.lastService = 'Invalid date'
    } else if (date > new Date()) {
      errors.lastService = 'Date cannot be in the future'
    }
  }

  // Total Spent validation (must be positive number)
  if (formData.totalSpent !== '' && formData.totalSpent !== null && formData.totalSpent !== undefined) {
    const amount = parseFloat(formData.totalSpent)
    if (isNaN(amount)) {
      errors.totalSpent = 'Must be a valid number'
    } else if (amount < 0) {
      errors.totalSpent = 'Must be a positive number'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone) {
  const phoneDigits = phone.replace(/\D/g, '')
  return phoneDigits.length >= 10
}

export function validateDate(dateString) {
  const date = new Date(dateString)
  return !isNaN(date.getTime()) && date <= new Date()
}

export function validateTagForm(formData) {
  const errors = {}

  // Name validation
  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Tag name must be at least 2 characters'
  } else if (formData.name.length > 50) {
    errors.name = 'Tag name must be less than 50 characters'
  }

  // Icon validation
  if (!formData.icon) {
    errors.icon = 'Please select an icon'
  }

  // Color validation
  if (!formData.color) {
    errors.color = 'Please select a color'
  }

  // Definition validation
  if (!formData.definition || formData.definition.trim().length < 10) {
    errors.definition = 'Definition must be at least 10 characters'
  } else if (formData.definition.length > 200) {
    errors.definition = 'Definition must be less than 200 characters'
  }

  // Trigger validation
  if (!formData.trigger || formData.trigger.trim().length < 10) {
    errors.trigger = 'Trigger description must be at least 10 characters'
  } else if (formData.trigger.length > 200) {
    errors.trigger = 'Trigger description must be less than 200 characters'
  }

  // Type validation
  if (!formData.type || !['auto', 'manual'].includes(formData.type)) {
    errors.type = 'Please select a valid type'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
