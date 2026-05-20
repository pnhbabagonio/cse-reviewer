const categoryColors = {
  verbal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  analytical: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  numerical: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  general_info: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  filipino: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const categoryNames = {
  verbal: 'Verbal',
  analytical: 'Analytical',
  numerical: 'Numerical',
  general_info: 'General Info',
  filipino: 'Filipino',
}

export default function CategoryBadge({ category }) {
  const label = categoryNames[category] || category || 'Uncategorized'

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${categoryColors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>
      {label.replace('_', ' ')}
    </span>
  )
}
