// Count SMS characters (handle GSM-7 vs Unicode)
export function countSMSCharacters(message) {
  // GSM-7 character set (extended characters like € count as 2)
  const gsmRegex = /^[@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-Z^a-z{|}~¿\n\r]*$/
  const isGSM = gsmRegex.test(message)

  const length = message.length
  const maxLength = isGSM ? 160 : 70
  const segmentCount = Math.ceil(length / maxLength)

  return {
    count: length,
    isGSM,
    maxLength,
    segmentCount,
  }
}

// Add tag to array
export function addTag(tags, newTag) {
  const trimmedTag = newTag.trim()
  if (!trimmedTag || tags.includes(trimmedTag)) return tags
  if (tags.length >= 10) return tags
  return [...tags, trimmedTag]
}

// Remove tag from array
export function removeTag(tags, tagToRemove) {
  return tags.filter((t) => t !== tagToRemove)
}
