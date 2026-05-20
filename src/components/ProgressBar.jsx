export default function ProgressBar({ value, max, color = 'bg-navy', className = '' }) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
