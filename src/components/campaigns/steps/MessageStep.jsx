import PropTypes from 'prop-types'
import { useRef, useState } from 'react'
import { Search } from 'lucide-react'

const PERSONALIZATION_OPTIONS = [
  { key: 'Name', description: "Customer's full name" },
  { key: 'Email', description: "Customer's email address" },
  { key: 'Phone', description: "Customer's phone number" },
  { key: 'Address', description: "Customer's address" },
  { key: 'Status', description: "Customer's status (active/inactive)" },
  { key: 'Type', description: "Customer type (Recurring/Residential)" },
  { key: 'Last Service', description: "Customer's last service date" },
  { key: 'Total Spent', description: 'Total amount spent by the customer' },
  { key: 'Profile Name', description: 'Your profile name (first + last)' },
  { key: 'Profile First Name', description: 'Your first name from Settings' },
  { key: 'Profile Last Name', description: 'Your last name from Settings' },
  { key: 'Profile Email', description: 'Your email from Settings' },
  { key: 'Profile Phone', description: 'Your phone from Settings' },
  { key: 'Company Name', description: 'Your company name from Settings' },
  { key: 'Company Address', description: 'Your company address from Settings' },
  { key: 'Company Phone', description: 'Your company phone from Settings' },
  { key: 'Company Website', description: 'Your company website from Settings' },
  { key: 'Sender Name', description: 'Your SMS sender name from Settings' },
]

function MessageStep({
  message,
  templateId = null,
  templates,
  defaultSignature = '',
  onMessageChange,
  onTemplateSelect,
  error = '',
}) {
  const [templateSearchTerm, setTemplateSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const textareaRef = useRef(null)

  const categories = ['all', ...new Set(templates.map((t) => t.category))]

  const filteredTemplates = templates.filter((template) => {
    const search = templateSearchTerm.toLowerCase()

    const matchesSearch =
      template.name.toLowerCase().includes(search) ||
      template.message.toLowerCase().includes(search)

    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleTemplateClick = (template) => {
    onTemplateSelect(template.id, template.message)
    setShowTemplates(false)
  }

  const getSMSCount = (text) => {
    if (text.length === 0) return 0
    if (text.length <= 160) return 1
    return Math.ceil(text.length / 153)
  }

  const signatureText = (defaultSignature || '').trim()
  const fullText =
    signatureText.length > 0 ? `${message || ''} ${signatureText}`.trim() : message || ''

  const smsCount = getSMSCount(fullText)
  const isSignatureConfigured = signatureText.length > 0

  const handleTextareaKeyDown = (e) => {
    if (e.key === '{') {
      e.preventDefault()
      const el = textareaRef.current
      const current = message || ''
      const start = el ? el.selectionStart : current.length
      const end = el ? el.selectionEnd : current.length

      const insert = '{{  }}'
      const newValue = current.slice(0, start) + insert + current.slice(end)
      const newCursorPos = start + 3

      onMessageChange(newValue)
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
    const current = message || ''
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

    onMessageChange(newValue)
    setShowSuggestions(false)

    window.requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursorPos
        textareaRef.current.selectionEnd = newCursorPos
        textareaRef.current.focus()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose Template (Optional)
        </label>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={templateSearchTerm}
              onChange={(e) => setTemplateSearchTerm(e.target.value)}
              onFocus={() => setShowTemplates(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        {showTemplates && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  {templates.length === 0
                    ? 'No templates available. Create templates in the Templates page first.'
                    : 'No templates found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateClick(template)}
                    className={`p-3 text-left rounded-lg border-2 transition-all hover:bg-white ${
                      templateId === template.id
                        ? 'border-blue-500 bg-white'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{template.category}</p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {template.message}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Textarea */}
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
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          placeholder="Write your message. Use {{ Name }} or {{ Email }} for personalization."
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

        {showSuggestions && (
          <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-sm max-w-md text-xs">
            <div className="px-3 py-2 border-b border-gray-100 font-semibold text-gray-700">
              Personalization tags
            </div>
            <ul className="max-h-40 overflow-y-auto">
              {PERSONALIZATION_OPTIONS.map((opt) => (
                <li key={opt.key}>
                  <button
                    type="button"
                    onClick={() => handleInsertPlaceholder(opt.key)}
                    className="w-full flex items-start gap-2 px-3 py-2 hover:bg-gray-50 text-left"
                  >
                    <span className="font-mono text-xs text-blue-700">
                      {`{{ ${opt.key} }}`}
                    </span>
                    <span className="text-gray-600">{opt.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Character Counter */}
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-600">
            {fullText.length} characters
            {smsCount > 0 && (
              <span className="text-gray-500">
                {' '}
                ({smsCount} SMS)
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            {fullText.length > 160 && (
              <span className="text-orange-600">
                Multiple SMS messages ({Math.ceil(fullText.length / 153)} parts)
              </span>
            )}
          </p>
        </div>

        {/* Signature info */}
        <p
          className={`text-xs mt-2 ${
            isSignatureConfigured ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {isSignatureConfigured ? (
            <>
              Your default SMS signature will be automatically added to the end of this
              message and it counts toward the 160-character per-SMS limit. Personalization
              tags expand based on real customer data, so try to keep your written message
              around 140 characters to avoid multi-part SMS whenever possible.
            </>
          ) : (
            <>
              You didn&apos;t set any signature message for this profile yet. Add one in
              Settings &gt; SMS Configuration to have it appended automatically (it also
              counts toward the 160-character limit and personalization tags will expand to
              the customer&apos;s real data when sending).
            </>
          )}
        </p>

        {/* Placeholders info */}
        <p className="text-xs text-gray-500 mt-3">
          Personalization tags (for example <span className="font-mono">{'{{ Name }}'}</span>,
          <span className="font-mono">{'{{ Email }}'}</span>, <span className="font-mono">{'{{ Company Name }}'}</span>)
          automatically pull customer or profile details into the message at send time.
          Type <span className="font-mono">{'{{'}</span> to see the full list.
        </p>
      </div>
    </div>
  )
}

MessageStep.propTypes = {
  message: PropTypes.string.isRequired,
  templateId: PropTypes.number,
  templates: PropTypes.arrayOf(PropTypes.object).isRequired,
  defaultSignature: PropTypes.string,
  onMessageChange: PropTypes.func.isRequired,
  onTemplateSelect: PropTypes.func.isRequired,
  error: PropTypes.string,
}

export default MessageStep
