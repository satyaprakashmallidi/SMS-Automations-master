export const ALLOWED_FILE_TYPES = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

export const REQUIRED_COLUMNS = [
  'Name',
  'Phone',
  'Email',
  'Status',
  'Type',
  'Last Service',
  'Address',
  'Total Spent',
]

const parseCSVLine = (line = '') => {
  const values = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

const parseCurrencyValue = (value) => {
  if (value == null) return 0
  const normalized = String(value).replace(/[^0-9.-]/g, '')
  if (!normalized) return 0
  const parsed = Number(normalized)
  return Number.isNaN(parsed) ? 0 : parsed
}

const normalizeCustomerType = (value) => {
  if (value == null) return 'Recurring'
  const raw = String(value).trim()
  if (!raw) return 'Recurring'

  const normalized = raw.toLowerCase()
  const collapsed = normalized.replace(/[\s_-]+/g, '')

  if (collapsed.includes('opt') && collapsed.includes('out')) {
    return 'Opted Out'
  }
  if (collapsed.startsWith('res')) {
    return 'Residential'
  }
  if (collapsed.startsWith('rec')) {
    return 'Recurring'
  }

  return raw
}

export function validateFileType(file) {
  if (file.type === 'text/csv') return true
  if (file.name.endsWith('.csv')) return true
  if (file.name.endsWith('.xlsx')) return true
  if (file.name.endsWith('.xls')) return true
  return false
}

export async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target.result
        const lines = text.split(/\r?\n/).filter((line) => line.trim())

        if (lines.length === 0) {
          reject(new Error('File is empty'))
          return
        }

        const headers = parseCSVLine(lines[0])

        const missingColumns = REQUIRED_COLUMNS.filter((col) => !headers.includes(col))
        if (missingColumns.length > 0) {
          reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`))
          return
        }

        const data = []
        for (let i = 1; i < lines.length; i += 1) {
          const rawLine = lines[i]
          if (!rawLine.trim()) continue

          const values = parseCSVLine(rawLine)
          const row = {}

          headers.forEach((header, index) => {
            row[header] = values[index] != null ? values[index] : ''
          })

          data.push(row)
        }

        if (data.length === 0) {
          reject(new Error('No data rows found in file'))
          return
        }

        resolve(data)
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error.message}`))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Normalize phone number - adds +1 for 10-digit US numbers
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return ''
  const digits = String(phone).replace(/\D/g, '')
  // If exactly 10 digits, assume US and prepend +1
  if (digits.length === 10) {
    return `+1${digits}`
  }
  // If already has country code (11 digits starting with 1 for US), format with +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  // Return digits only for other formats
  return digits
}

export function transformToCustomers(data) {
  return data.map((row, index) => {
    return {
      id: Date.now() + index,
      name: row.Name || '',
      phone: normalizePhoneNumber(row.Phone),
      email: row.Email || '',
      status: (row.Status || 'active').toLowerCase(),
      type: normalizeCustomerType(row.Type),
      lastService: row['Last Service'] && row['Last Service'] !== 'Never' ? row['Last Service'] : null,
      address: row.Address || '',
      totalSpent: parseCurrencyValue(row['Total Spent']),
      tags: [],
      createdAt: new Date().toISOString(),
    }
  })
}

export function exportToCSV(customers) {
  const headers = REQUIRED_COLUMNS.join(',')

  const rows = customers.map((c) => [
    `"${c.name}"`,
    c.phone,
    c.email,
    c.status,
    c.type,
    c.lastService || 'Never',
    `"${c.address}"`,
    c.totalSpent,
  ])

  const csvContent = [headers, ...rows.map((r) => r.join(','))].join('\n')

  return csvContent
}

export function downloadFile(content, filename, type = 'text/csv') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
