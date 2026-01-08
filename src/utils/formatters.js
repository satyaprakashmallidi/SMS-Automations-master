/**
 * Formatter Utilities
 * Collection of functions for formatting various data types
 */

/**
 * Format a date to a readable string
 * @param {Date|string|number} date - The date to format
 * @param {string} locale - The locale for formatting (default: 'en-US')
 * @returns {string} Formatted date string
 *
 * @example
 * formatDate(new Date()) // "12/27/2024"
 * formatDate(new Date(), 'fr-FR') // "27/12/2024"
 */
export function formatDate(date, locale = 'en-US') {
  return new Date(date).toLocaleDateString(locale)
}

/**
 * Format a date and time to a readable string
 * @param {Date|string|number} date - The date to format
 * @param {string} locale - The locale for formatting (default: 'en-US')
 * @returns {string} Formatted date and time string
 *
 * @example
 * formatDateTime(new Date()) // "12/27/2024, 3:30:45 PM"
 */
export function formatDateTime(date, locale = 'en-US') {
  return new Date(date).toLocaleString(locale)
}

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - The locale for formatting (default: 'en-US')
 * @returns {string} Formatted currency string
 *
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1234.56, 'EUR', 'de-DE') // "1.234,56 €"
 */
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Truncate a string to a maximum length
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} Truncated string
 *
 * @example
 * truncateString('Hello World', 8) // "Hello W..."
 */
export function truncateString(str, maxLength = 50, suffix = '...') {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 *
 * @example
 * capitalize('hello world') // "Hello world"
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert camelCase to Space Separated
 * @param {string} str - The string to convert
 * @returns {string} Space separated string
 *
 * @example
 * formatCamelCase('myVariableName') // "My Variable Name"
 */
export function formatCamelCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim()
}

/**
 * Format a phone number
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} Formatted phone number
 *
 * @example
 * formatPhoneNumber('1234567890') // "(123) 456-7890"
 */
export function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '')
  if (cleaned.length !== 10) return phoneNumber
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
}
