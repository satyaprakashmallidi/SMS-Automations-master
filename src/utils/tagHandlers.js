import { TAG_ICONS } from '../data/tagsData'

export const REQUIRED_TAG_COLUMNS = [
  'Tag Name',
  'Definition',
  'Trigger',
  'Type',
]

// Validate if icon name exists in TAG_ICONS
export function isValidIcon(iconName) {
  return TAG_ICONS.some((icon) => icon.name === iconName)
}

// Validate hex color format
export function isValidHexColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color)
}

// Transform CSV data to tag objects
export function transformToTags(data) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#F97316']
  const icons = ['Star', 'Users', 'TrendingUp', 'DollarSign', 'Gift', 'AlertTriangle', 'Heart', 'Award']

  return data.map((row, index) => ({
    id: Date.now() + index,
    name: row['Tag Name'] || '',
    icon: row.Icon || icons[index % icons.length],
    color: row.Color || colors[index % colors.length],
    definition: row.Definition || '',
    trigger: row.Trigger || '',
    type: (row.Type || 'auto').toLowerCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
}

// Validate and fix imported tags
export function validateTags(tags) {
  return tags.map((tag) => {
    // Validate and fix icon
    if (!isValidIcon(tag.icon)) {
      tag.icon = 'Tag' // Default icon
    }

    // Validate and fix color
    if (!isValidHexColor(tag.color)) {
      tag.color = '#3B82F6' // Default blue
    }

    // Validate type
    if (tag.type !== 'auto' && tag.type !== 'manual') {
      tag.type = 'auto'
    }

    return tag
  })
}

// Export tags to CSV
export function exportTagsToCSV(tags) {
  const headers = REQUIRED_TAG_COLUMNS.join(',')

  const rows = tags.map((tag) => [
    `"${tag.name}"`,
    tag.icon,
    tag.color,
    `"${tag.definition}"`,
    `"${tag.trigger}"`,
    tag.type,
  ])

  return [headers, ...rows.map((r) => r.join(','))].join('\n')
}
