const difficultyColors = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  average: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  difficult: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export default function DifficultyBadge({ difficulty }) {
  const normalized = (typeof difficulty === 'string' ? difficulty.trim().toLowerCase() : '')
  const label = normalized || 'unknown'

  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${
        difficultyColors[label] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
      }`}
    >
      {label}
    </span>
  )
}
