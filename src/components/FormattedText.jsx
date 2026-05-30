import { parseInlineFormat } from '../utils/parseInlineFormat'

/**
 * Renders text with __text__ underline markup support.
 *
 * @param {string}  text      - Raw text string, may contain __text__ markup
 * @param {string}  className - Optional additional classes for the wrapper span
 * @param {string}  as        - HTML element to use as wrapper ('span' default, 'p' for block)
 *
 * @example
 * 
 * // renders: The quick brown fox (with "quick" underlined)
 */
export default function FormattedText({ text, className = '', as: Tag = 'span' }) {
  const segments = parseInlineFormat(text)

  // If no formatting needed, render plain text directly for performance
  if (segments.length === 1 && !segments[0].underline) {
    return <Tag className={className}>{segments[0].text}</Tag>
  }

  return (
    <Tag className={className}>
      {segments.map((segment, index) =>
        segment.underline ? (
          <u key={index} className="underline">
            {segment.text}
          </u>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </Tag>
  )
}
