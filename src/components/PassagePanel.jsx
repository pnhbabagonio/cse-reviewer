import { useState } from 'react'
import { ChevronUp, ChevronDown, BookOpen } from 'lucide-react'

export default function PassagePanel({ title, passageText, groupIndex, groupSize }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="rounded-xl border border-blue-200 dark:border-blue-800
                    bg-blue-50 dark:bg-blue-950/30 mb-4 overflow-hidden"
    >
      <div
        className="flex items-center justify-between px-4 py-3
                      border-b border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
          <div>
            {title && (
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {title} <span className="text-xs text-gray-500 dark:text-gray-400">(Question {groupIndex + 1} of {groupSize})</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 rounded-md text-blue-500 hover:bg-blue-100
                       dark:hover:bg-blue-900/50 transition-colors"
            type="button"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 max-h-56 overflow-y-auto">
          {String(passageText || '')
            .split('\n\n')
            .map((stanza, i) => (
              <p
                key={i}
                className="text-sm text-gray-700 dark:text-gray-300
                                  leading-relaxed mb-3 last:mb-0 whitespace-pre-line"
              >
                {stanza}
              </p>
            ))}
        </div>
      )}

      {collapsed && (
        <div className="px-4 py-2">
          <p className="text-xs text-blue-500 dark:text-blue-400 italic">
            Passage hidden — tap the arrow to expand
          </p>
        </div>
      )}
    </div>
  )
}