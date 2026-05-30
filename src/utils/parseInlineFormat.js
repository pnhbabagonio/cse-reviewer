/**
 * Parses a string with __text__ underline markup into segments.
 *
 * @param {string} text - Raw string possibly containing __text__ markup
 * @returns {Array}
 *
 * @example
 * parseInlineFormat("The __quick__ brown fox")
 * // → [
 * //     { text: "The ", underline: false },
 * //     { text: "quick", underline: true },
 * //     { text: " brown fox", underline: false }
 * //   ]
 */
export function parseInlineFormat(text) {
  if (!text || typeof text !== 'string') return [{ text: String(text ?? ''), underline: false }]

  // If no markup present, return early as a single plain segment
  if (!text.includes('__')) return [{ text, underline: false }]

  const segments = []
  // Split on __ boundaries — odd-indexed parts are underlined
  const parts = text.split('__')

  parts.forEach((part, index) => {
    if (part === '') return // skip empty strings from consecutive __
    segments.push({
      text: part,
      underline: index % 2 === 1 // odd indices are inside __ __ pairs
    })
  })

  return segments
}

/**
 * Returns true if the string contains any __text__ markup.
 * Useful for conditionally applying FormattedText vs plain text.
 */
export function hasInlineFormat(text) {
  return typeof text === 'string' && text.includes('__')
}
