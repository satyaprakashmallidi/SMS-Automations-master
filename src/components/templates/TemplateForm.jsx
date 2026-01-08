import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import InputField from '../ui/InputField'
import SelectField from '../ui/SelectField'
import Button from '../Button'
import { categoryOptions } from '../../data/templatesData'
import { countSMSCharacters } from '../../utils/templateUtils'
import { useAuth } from '../../hooks/useAuth'
import { getTags } from '../../services/tagsService'
import { getSettings } from '../../services/settingsService'

const PERSONALIZATION_KEYS = [
  'Name',
  'Email',
  'Phone',
  'Address',
  'Status',
  'Type',
  'Last Service',
  'Total Spent',
  'Profile Name',
  'Profile First Name',
  'Profile Last Name',
  'Profile Email',
  'Profile Phone',
  'Company Name',
  'Company Address',
  'Company Phone',
  'Company Website',
  'Sender Name',
]

function TemplateForm({ template = null, onSave, onCancel }) {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    category: 'Welcome',
    message: '',
    tags: [],
  })

  const [errors, setErrors] = useState({})
  const [availableTags, setAvailableTags] = useState([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [defaultSignature, setDefaultSignature] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const textareaRef = useRef(null)

  const smsInfo = countSMSCharacters(formData.message)
  const isSignatureConfigured =
    defaultSignature && defaultSignature.trim().length > 0

  useEffect(() => {
    const fetchTags = async () => {
      try {
        if (!user?.id) return
        setIsLoadingTags(true)
        const tags = await getTags(user.id)
        setAvailableTags(tags.map((tag) => tag.name) || [])
      } catch (error) {
        console.error('Error fetching tags:', error)
        setAvailableTags([])
      } finally {
        setIsLoadingTags(false)
      }
    }

    fetchTags()
  }, [user?.id])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!user?.id) return
        const settings = await getSettings(user.id)
        if (settings?.defaultSignature) {
          setDefaultSignature(settings.defaultSignature)
        }
      } catch (error) {
        console.error('Error fetching settings in TemplateForm:', error)
      }
    }

    fetchSettings()
  }, [user?.id])

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        category: template.category,
        message: template.message,
        tags: template.tags || [],
      })
    }
  }, [template])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = 'Template name must be at least 3 characters'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleMessageChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      message: value,
    }))

    if (errors.message) {
      setErrors((prev) => ({
        ...prev,
        message: '',
      }))
    }
  }

  const handleMessageKeyDown = (e) => {
    if (e.key === '{') {
      e.preventDefault()
      const el = textareaRef.current
      const current = formData.message || ''
      const start = el ? el.selectionStart : current.length
      const end = el ? el.selectionEnd : current.length

      const insert = '{{  }}'
      const newValue = current.slice(0, start) + insert + current.slice(end)
      const newCursorPos = start + 3

      handleMessageChange(newValue)
      setShowSuggestions(true)

      window.requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newCursorPos
          textareaRef.current.selectionEnd = newCursorPos
          textareaRef.current.focus()
        }
      })
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleInsertPlaceholder = (placeholderKey) => {
    const el = textareaRef.current
    const current = formData.message || ''
    const cursor = el ? el.selectionStart : current.length

    let newValue = current
    let newCursorPos = cursor

    const openIndex = current.lastIndexOf('{{', cursor)
    const closeIndex = current.indexOf('}}', cursor)

    const tokenText = ` ${placeholderKey} `

    if (openIndex !== -1 && closeIndex !== -1 && openIndex < closeIndex) {
      newValue =
        current.slice(0, openIndex + 2) + tokenText + current.slice(closeIndex)
      newCursorPos = openIndex + 2 + tokenText.length
    } else {
      const insert = `{{ ${placeholderKey} }}`
      newValue = current.slice(0, cursor) + insert + current.slice(cursor)
      newCursorPos = cursor + insert.length
    }

    handleMessageChange(newValue)
    setShowSuggestions(false)

    window.requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursorPos
        textareaRef.current.selectionEnd = newCursorPos
        textareaRef.current.focus()
      }
    })
  }

  const handleTagToggle = (tagName) => {
    setFormData((prev) => {
      const isSelected = prev.tags.includes(tagName)
      return {
        ...prev,
        tags: isSelected
          ? prev.tags.filter((t) => t !== tagName)
          : [...prev.tags, tagName],
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    onSave({
      ...formData,
      characterCount: smsInfo.count,
      createdAt: template?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    })
  }

  const getCharCountColor = () => {
    if (smsInfo.count === 0) return 'text-gray-500'
    if (smsInfo.count <= 160) return 'text-green-600'
    if (smsInfo.count <= 320) return 'text-yellow-600'
    return 'text-red-600'
  }

  const isFormValid = () => {
    return (
      formData.name.trim().length >= 3 &&
      formData.category &&
      formData.message.trim().length >= 10
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Template Name */}
      <div>
        <InputField
          label="Template Name"
          name="name"
          type="text"
          placeholder="e.g., VIP Exclusive Offer"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 3 characters required</p>
      </div>

      {/* Category */}
      <SelectField
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        options={categoryOptions}
        error={errors.category}
        required
      />

      {/* Message */}
      <div
        className={`rounded-lg p-3 border ${
          isSignatureConfigured ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
        }`}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <textarea
          ref={textareaRef}
          name="message"
          value={formData.message}
          onChange={(e) => handleMessageChange(e.target.value)}
          onKeyDown={handleMessageKeyDown}
          placeholder="Enter your message template here... Use {{ Name }} or {{ Email }} for personalization"
          rows={6}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none ${
            errors.message ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-600">{errors.message}</p>
        )}

        {showSuggestions && (
          <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-sm max-w-md text-xs">
            <div className="px-3 py-2 border-b border-gray-100 font-semibold text-gray-700">
              Personalization tags
            </div>
            <ul className="max-h-40 overflow-y-auto">
              {PERSONALIZATION_KEYS.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => handleInsertPlaceholder(key)}
                    className="w-full flex items-start gap-2 px-3 py-2 hover:bg-gray-50 text-left"
                  >
                    <span className="font-mono text-xs text-blue-700">
                      {`{{ ${key} }}`}
                    </span>
                    <span className="text-gray-600">
                      {key === 'Name' && "Customer's full name"}
                      {key === 'Email' && "Customer's email address"}
                      {key === 'Phone' && "Customer's phone number"}
                      {key === 'Address' && "Customer's address"}
                      {key === 'Status' && "Customer's status"}
                      {key === 'Type' && "Customer type (Recurring/Residential)"}
                      {key === 'Last Service' && "Customer's last service date"}
                      {key === 'Total Spent' && 'Total amount spent by the customer'}
                      {key === 'Profile Name' && 'Your profile name (first + last)'}
                      {key === 'Profile First Name' && 'Your first name from Settings'}
                      {key === 'Profile Last Name' && 'Your last name from Settings'}
                      {key === 'Profile Email' && 'Your email from Settings'}
                      {key === 'Profile Phone' && 'Your phone from Settings'}
                      {key === 'Company Name' && 'Your company name from Settings'}
                      {key === 'Company Address' && 'Your company address from Settings'}
                      {key === 'Company Phone' && 'Your company phone from Settings'}
                      {key === 'Company Website' && 'Your company website from Settings'}
                      {key === 'Sender Name' && 'Your SMS sender name from Settings'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>

        {/* Character Count Info */}
        <div className={`mt-2 text-sm font-medium ${getCharCountColor()}`}>
          {smsInfo.count} characters ({smsInfo.segmentCount} SMS
          {smsInfo.segmentCount !== 1 ? 's' : ''})
          {!smsInfo.isGSM && (
            <span className="ml-2 text-xs">(Unicode - 70 chars per SMS)</span>
          )}
          {smsInfo.isGSM && (
            <span className="ml-2 text-xs">(GSM - 160 chars per SMS)</span>
          )}
        </div>

        {/* Personalization helper */}
        <p className="mt-2 text-xs text-gray-500">
          Personalization tags such as <span className="font-mono">{'{{ Name }}'}</span>,
          <span className="font-mono">{'{{ Email }}'}</span>, or <span className="font-mono">{'{{ Sender Name }}'}</span>
          insert real customer or profile info when this template sends. Type{' '}
          <span className="font-mono">{'{{'}</span> in the editor to pick from the complete list.
        </p>

        {/* Signature note */}
        <p
          className={`mt-2 text-xs ${
            isSignatureConfigured ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {isSignatureConfigured ? (
            <>
              Your default SMS signature from Settings will be automatically added to the
              end of messages that use this template, and it counts toward the
              160-character per-SMS limit. Personalization tags expand with real customer
              data, so aim to keep your base template text near 140 characters to reduce
              multi-part SMS.
            </>
          ) : (
            <>
              You didn&apos;t set any signature message for this profile yet. Add one in
              Settings &gt; SMS Configuration to have it appended automatically (it also
              counts toward the 160-character limit and personalization tags expand to the
              customer&apos;s real data).
            </>
          )}
        </p>
      </div>

      {/* Tags Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Linked Tags (Optional)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Select tags from your Tags page to link with this template
        </p>

        {isLoadingTags ? (
          <div className="text-sm text-gray-500">Loading tags...</div>
        ) : availableTags.length === 0 ? (
          <div className="p-3 bg-gray-50 rounded border border-gray-300 text-sm text-gray-600">
            No tags available - create tags first in the Tags page
          </div>
        ) : (
          <div className="space-y-2 border border-gray-300 rounded p-3 bg-gray-50 max-h-48 overflow-y-auto">
            {availableTags.map((tag) => (
              <label key={tag} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.tags.includes(tag)}
                  onChange={() => handleTagToggle(tag)}
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{tag}</span>
              </label>
            ))}
          </div>
        )}

        {formData.tags.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Selected tags:</p>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <Button variant="secondary" size="sm" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="submit"
          disabled={!isFormValid()}
          className={!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {template ? 'Save Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  )
}

TemplateForm.propTypes = {
  template: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    category: PropTypes.string,
    message: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    createdAt: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default TemplateForm
