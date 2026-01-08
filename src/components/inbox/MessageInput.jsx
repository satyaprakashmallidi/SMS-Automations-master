import { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Send, Loader2 } from 'lucide-react'

const PERSONALIZATION_OPTIONS = [
  { key: 'Name', description: "Customer's full name" },
  { key: 'Email', description: "Customer's email address" },
  { key: 'Phone', description: "Customer's phone number" },
  { key: 'Address', description: "Customer's address" },
  { key: 'Status', description: "Customer's status" },
  { key: 'Type', description: 'Customer type' },
  { key: 'Last Service', description: "Customer's last service date" },
  { key: 'Total Spent', description: 'Total lifetime spend' },
  { key: 'Profile Name', description: 'Your profile name' },
  { key: 'Profile Email', description: 'Your profile email' },
  { key: 'Profile Phone', description: 'Your profile phone' },
  { key: 'Company Name', description: 'Your company name' },
  { key: 'Company Address', description: 'Your company address' },
  { key: 'Company Phone', description: 'Your company phone' },
  { key: 'Company Website', description: 'Your company website' },
  { key: 'Sender Name', description: 'Your sender name' },
]

function MessageInput({ onSend, disabled = false, isSending = false }) {
  const [message, setMessage] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const textareaRef = useRef(null)

  const handleSend = () => {
    if (message.trim() && !disabled && !isSending) {
      onSend(message)
      setMessage('')
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
      return
    }

    if (e.key === '{') {
      e.preventDefault()
      const textarea = textareaRef.current
      const current = message || ''
      const start = textarea ? textarea.selectionStart : current.length
      const end = textarea ? textarea.selectionEnd : current.length
      const insert = '{{  }}'
      const newValue = current.slice(0, start) + insert + current.slice(end)
      const newCursorPos = start + 3

      setMessage(newValue)
      setShowSuggestions(true)

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newCursorPos
          textareaRef.current.selectionEnd = newCursorPos
          textareaRef.current.focus()
        }
      })
      return
    }

    if (e.key === 'Escape' && showSuggestions) {
      setShowSuggestions(false)
    }
  }

  const handleInsertPlaceholder = (placeholderKey) => {
    const textarea = textareaRef.current
    const current = message || ''
    const cursor = textarea ? textarea.selectionStart : current.length

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

    setMessage(newValue)
    setShowSuggestions(false)

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursorPos
        textareaRef.current.selectionEnd = newCursorPos
        textareaRef.current.focus()
      }
    })
  }

  return (
    <div className="px-3 py-2 border-t border-gray-100 bg-white">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          className={`
            flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md
            resize-none focus:outline-none focus:ring-1
            focus:ring-blue-500 focus:border-blue-200
            hover:border-gray-300
            transition-colors duration-200 placeholder:text-gray-400
            text-sm leading-snug
            ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}
          `}
          placeholder={disabled ? 'Select a conversation to send messages' : 'Type a message...'}
          rows="2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim() || isSending}
          className={`
            px-3 py-1.5 rounded-md font-medium transition-all
            flex items-center justify-center gap-1.5 flex-shrink-0
            shadow-sm hover:shadow active:shadow-none
            ${
              disabled || !message.trim() || isSending
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }
          `}
          title="Send message (Ctrl+Enter)"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isSending ? 'Sending…' : 'Send'}
          </span>
        </button>
      </div>

      {/* Character counter with keyboard hint */}
      {!disabled && (
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-400">
            Ctrl+Enter to send • Type <span className="font-mono">{'{'}</span> for personalization
          </p>
          <p
            className={`text-xs font-medium transition-colors ${
              message.length > 160 ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            {message.length}/160
          </p>
        </div>
      )}

      {showSuggestions && !disabled && (
        <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-sm max-w-md text-xs z-10">
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
    </div>
  )
}

MessageInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isSending: PropTypes.bool,
}

export default MessageInput
