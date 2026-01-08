const DAY_IN_MS = 24 * 60 * 60 * 1000

const sanitizeNumber = (value) => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (!value) return 0
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isNaN(numeric) ? 0 : numeric
}

const parseCurrencyThresholds = (text = '') => {
  const matches = [...text.matchAll(/\$([0-9,.]+)/g)]
  return matches.map((match) => sanitizeNumber(match[1]))
}

const parseDaysValue = (text = '') => {
  const genericMatch = text.match(/(\d+)\s*\+?\s*days/)
  return genericMatch ? Number(genericMatch[1]) : null
}

const daysSince = (dateString) => {
  if (!dateString) return null
  const parsed = new Date(dateString)
  if (Number.isNaN(parsed.getTime())) return null
  const diff = Date.now() - parsed.getTime()
  return diff / DAY_IN_MS
}

const buildSpendContext = (customers = []) => {
  const spendValues = customers
    .map((customer) => sanitizeNumber(customer.totalSpent))
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => a - b)

  const totalSpend = spendValues.reduce((sum, value) => sum + value, 0)
  const averageSpend = spendValues.length ? totalSpend / spendValues.length : 0

  const getTopPercentThreshold = (topPercent = 10) => {
    if (!spendValues.length) return 0
    const clamped = Math.min(Math.max(topPercent, 0), 100) / 100
    const index = Math.max(Math.floor(spendValues.length * (1 - clamped)), 0)
    return spendValues[index] ?? spendValues[spendValues.length - 1]
  }

  return {
    spendValues,
    averageSpend,
    getTopPercentThreshold,
  }
}

export const evaluateAutoTagMatch = (tag, customer, context) => {
  if (!tag || !customer) {
    return { matches: false, reason: 'Missing tag or customer details' }
  }

  const trigger = (tag.trigger || '').toLowerCase()
  if (!trigger.trim()) {
    return { matches: false, reason: 'Tag trigger is empty' }
  }

  const totalSpent = sanitizeNumber(customer.totalSpent)
  const daysSinceLastService = daysSince(customer.lastService)
  const daysSinceCreated = daysSince(customer.createdAt)

  // Rule 1: Top percentage by spend (e.g., "Top 10%")
  const percentMatch = trigger.match(/top\s*(\d+)\s*%/)
  if (percentMatch) {
    const percent = Number(percentMatch[1])
    const threshold = context.getTopPercentThreshold(percent)
    if (totalSpent >= threshold) {
      return {
        matches: true,
        reason: `Total spend ${totalSpent} is within top ${percent}% (threshold ${threshold})`,
      }
    }
  }

  // Rule 2: Currency thresholds (e.g., "$500+ lifetime spend")
  const currencyThresholds = parseCurrencyThresholds(tag.trigger || '')
  if (currencyThresholds.length) {
    const threshold = Math.min(...currencyThresholds.filter((value) => value > 0))
    if (threshold && totalSpent >= threshold) {
      return {
        matches: true,
        reason: `Total spend ${totalSpent} meets currency threshold ${threshold}`,
      }
    }
  }

  // Rule 3: No activity in last N days (e.g., "none in last 180 days")
  if (/none|haven't|no\s+(booking|activity)/.test(trigger) && /last\s+\d+\s+days/.test(trigger)) {
    const daysValue = parseDaysValue(trigger)
    if (daysValue && daysSinceLastService != null && daysSinceLastService >= daysValue) {
      return {
        matches: true,
        reason: `Last service was ${Math.round(daysSinceLastService)} days ago (>= ${daysValue})`,
      }
    }
  }

  // Rule 4: Activity within last N days (e.g., "within last 30 days")
  if (/within\s+last\s+\d+\s+days/.test(trigger)) {
    const daysValue = parseDaysValue(trigger)
    const referenceDays = daysSinceCreated ?? daysSinceLastService
    if (daysValue && referenceDays != null && referenceDays <= daysValue) {
      return {
        matches: true,
        reason: `Activity ${Math.round(referenceDays)} days ago (<= ${daysValue})`,
      }
    }
  }

  // Rule 5: "Only 1 booking" heuristics
  if (/only\s+1|single\s+booking/.test(trigger)) {
    const daysValue = parseDaysValue(trigger)
    const lowSpendThreshold = context.averageSpend * 1.2 || 200
    const meetsSpend = totalSpent > 0 && totalSpent <= lowSpendThreshold
    const meetsDays = daysValue ? daysSinceLastService != null && daysSinceLastService >= daysValue : true
    if (meetsSpend && meetsDays) {
      return {
        matches: true,
        reason: `Spend ${totalSpent} suggests single booking with ${Math.round(daysSinceLastService ?? 0)} days elapsed`,
      }
    }
  }

  // Rule 6: Lead inference based on status
  if (/lead/.test(trigger) && /inquiry|quote/.test(trigger)) {
    const isPending = customer.status === 'pending'
    if (isPending) {
      return {
        matches: true,
        reason: 'Customer status is pending, interpreted as lead',
      }
    }
    return { matches: false, reason: 'Lead triggers require pending status' }
  }

  return { matches: false, reason: 'No auto-tag rules matched' }
}

export const autoApplyTagToCustomers = (tag, customers = []) => {
  if (!tag || tag.id == null) {
    throw new Error('Tag must have a valid id before auto-applying')
  }

  const context = buildSpendContext(customers)
  let matchedCount = 0
  let appliedCount = 0
  let alreadyTagged = 0
  let updated = customers
  let changed = false

  const nextCustomers = customers.map((customer) => {
    const { matches } = evaluateAutoTagMatch(tag, customer, context)
    if (!matches) return customer

    matchedCount += 1
    const currentTags = Array.isArray(customer.tags) ? customer.tags : []
    if (currentTags.includes(tag.id)) {
      alreadyTagged += 1
      return customer
    }

    appliedCount += 1
    changed = true
    return {
      ...customer,
      tags: [...currentTags, tag.id],
    }
  })

  if (changed) {
    updated = nextCustomers
  }

  return {
    updatedCustomers: updated,
    matchedCount,
    appliedCount,
    alreadyTagged,
  }
}
