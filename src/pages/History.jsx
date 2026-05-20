import { useState } from 'react'
import useProgressStore from '../store/progressStore'
import Modal from '../components/Modal'
import ProgressBar from '../components/ProgressBar'

export default function History() {
  const { sessions, clearHistory } = useProgressStore()
  const [showClearModal, setShowClearModal] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const sortedSessions = sessions

  const handleClear = () => {
    clearHistory()
    setShowClearModal(false)
  }

  if (sessions.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-bold mb-2">No Exam History Yet</h2>
        <p className="text-gray-500 mb-6">Take your first exam to see your progress here!</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary">Take Exam</button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-navy dark:text-white">Exam History</h1>
        <button onClick={() => setShowClearModal(true)} className="text-red-600 text-sm">Clear All</button>
      </div>

      <div className="space-y-3">
        {sortedSessions.map(session => (
          <div key={session.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{new Date(session.date).toLocaleString()}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{session.mode}</span>
                  {session.categories.slice(0,2).map(c => <span key={c} className="text-xs px-2 py-0.5 bg-gray-100 rounded">{c}</span>)}
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xl font-bold ${session.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.round(session.percentage)}%
                </span>
                <div className="text-xs">{session.score}/{session.totalQuestions}</div>
              </div>
            </div>
            <ProgressBar value={session.score} max={session.totalQuestions} className="mt-2" />
            <button
              onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
              className="mt-2 text-xs text-gold"
            >
              {expandedId === session.id ? 'Hide details' : 'Show details'}
            </button>
            {expandedId === session.id && session.categoryBreakdown && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-sm font-semibold mb-1">Category Breakdown:</p>
                {Object.entries(session.categoryBreakdown).map(([cat, data]) => (
                  <div key={cat} className="flex justify-between text-xs">
                    <span className="capitalize">{cat}</span>
                    <span>{data.correct}/{data.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={showClearModal} onClose={() => setShowClearModal(false)} title="Clear History">
        <p>Are you sure you want to delete all exam history? This action cannot be undone.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setShowClearModal(false)} className="flex-1 btn-outline">Cancel</button>
          <button onClick={handleClear} className="flex-1 bg-red-600 text-white py-2 rounded-lg">Clear</button>
        </div>
      </Modal>
    </div>
  )
}
