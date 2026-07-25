import { useState, useRef, useEffect } from 'react'
import { Flag } from 'lucide-react'
import useFlagStore, { FLAG_REASONS } from '../store/flagStore'

export default function FlagButton({ questionId, size = 'sm' }) {
  const { isFlagged, getFlag, flagQuestion, unflagQuestion } = useFlagStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const flagged = isFlagged(questionId)
  const currentFlag = getFlag(questionId)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sizeClasses = size === 'sm' ? 'p-1.5' : 'p-2'
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (flagged) {
            unflagQuestion(questionId)
          } else {
            setShowDropdown(!showDropdown)
          }
        }}
        className={`${sizeClasses} rounded-lg transition-colors ${
          flagged
            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={flagged ? `Flagged: ${FLAG_REASONS.find(r => r.value === currentFlag?.reason)?.label || 'Unknown'}` : 'Flag question'}
      >
        <Flag className={`${iconSize} ${flagged ? 'fill-red-500' : ''}`} />
      </button>

      {showDropdown && !flagged && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
          <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Report Issue
          </p>
          {FLAG_REASONS.map((reason) => (
            <button
              key={reason.value}
              onClick={(e) => {
                e.stopPropagation()
                flagQuestion(questionId, reason.value)
                setShowDropdown(false)
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <span>{reason.icon}</span>
              <span>{reason.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}