/**
 * Parses a string with __text__ underline markup into segments.
 * Consecutive underscores of 3 or more (like ______) are treated as literal text,
 * not as underline markup.
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
 *
 * @example
 * parseInlineFormat("Fill in the ______ blank")
 * // → [
 * //     { text: "Fill in the ______ blank", underline: false }
 * //   ]
 */
export function parseInlineFormat(text) {
  if (!text || typeof text !== 'string') return [{ text: String(text ?? ''), underline: false }]

  // If no markup present, return early as a single plain segment
  if (!text.includes('__')) return [{ text, underline: false }]

  const segments = []
  // Regex matches in priority order:
  // - _{3,}                  → 3+ underscores: literal fill-in-the-blank (e.g., ______)
  // - __([^_].*?[^_])__      → __text__ with content inside: underline markup
  // - _+                     → 1-2 underscores: literal
  // - [^_]+                  → plain text without underscores
  const regex = /_{3,}|__([^_].*?[^_])__|_+|[^_]+/g

  let match
  while ((match = regex.exec(text)) !== null) {
    if (match[1] !== undefined) {
      // Group 1 captured: this is __text__ underline markup
      segments.push({ text: match[1], underline: true })
    } else if (match[0].startsWith('___')) {
      // 3+ underscores: literal text (fill-in-the-blank)
      segments.push({ text: match[0], underline: false })
    } else {
      // Plain text or 1-2 underscores
      segments.push({ text: match[0], underline: false })
    }
  }

  // Fallback: if no segments were produced, return original as plain text
  if (segments.length === 0) return [{ text, underline: false }]

  return segments
}

/**
 * Returns true if the string contains any __text__ markup.
 * Ignores fill-in-the-blank underscores (3+ consecutive).
 * Useful for conditionally applying FormattedText vs plain text.
 *
 * @param {string} text - Raw string possibly containing __text__ markup
 * @returns {boolean}
 */
export function hasInlineFormat(text) {
  if (typeof text !== 'string' || !text.includes('__')) return false
  // Only return true if there's actual markup: __ followed by non-underscore content then __
  return /__[^_].*?[^_]__/.test(text)
}