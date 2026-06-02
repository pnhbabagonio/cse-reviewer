import { getSubcategoryConfig } from '../utils/subcategoryConfig'

/**
 * Displays a colored subcategory badge.
 *
 * @param {string}  subcategory  - subcategory key string (e.g., 'antonym', 'synonym')
 * @param {string}  size         - 'sm' (default) | 'xs' for compact display
 */
export default function SubcategoryBadge({ subcategory, size = 'sm' }) {
  if (!subcategory) return null
  const config = getSubcategoryConfig(subcategory)

  const sizeClass = size === 'xs'
    ? 'text-xs px-1.5 py-0.5'
    : 'text-xs px-2 py-1'

  return (
    <span className={`inline-flex items-center rounded-md font-medium border
                      ${sizeClass} ${config.colorClass} ${config.borderClass}`}>
      {config.label}
    </span>
  )
}
