import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import ScoreRing from '../components/ScoreRing'
import ProgressBar from '../components/ProgressBar'
import { Home, RotateCcw, Eye, FileText } from 'lucide-react'

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const session = state?.session

  if (!session) {
    return <Navigate to="/" replace />
  }

  const wrongQuestionIds = session.results.filter(r => !r.isCorrect).map(r => r.questionId)

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <ScoreRing percentage={session.percentage} size={160} />
        <div>
          <h1 className={`text-3xl font-bold ${session.passed ? 'text-green-600' : 'text-red-600'}`}>
            {session.passed ? 'PASSED!' : 'FAILED'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {session.score} out of {session.totalQuestions} correct
          </p>
          {session.mode === 'timed' && (
            <p className="text-sm text-gray-500 mt-2">
              ⏱️ Time taken: {Math.floor(session.timeTakenSeconds / 60)} min {session.timeTakenSeconds % 60} sec
            </p>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card space-y-3">
        <h2 className="font-bold text-lg">Per-Category Breakdown</h2>
        {Object.entries(session.categoryBreakdown || {}).map(([cat, data]) => (
          <div key={cat}>
            <div className="flex justify-between text-sm">
              <span className="capitalize">{cat}</span>
              <span>{data.correct}/{data.total} ({Math.round((data.correct/data.total)*100)}%)</span>
            </div>
            <ProgressBar value={data.correct} max={data.total} color="bg-gold" />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/review', { state: { session } })}
          className="w-full btn-outline flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" /> Review Answers
        </button>
        {wrongQuestionIds.length > 0 && (
          <button
            onClick={() => navigate('/setup', { state: { mode: session.mode, wrongQuestionIds } })}
            className="w-full btn-outline flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Retry Wrong Answers ({wrongQuestionIds.length})
          </button>
        )}
        <button
          onClick={() => navigate('/setup', { state: { mode: session.mode } })}
          className="w-full btn-outline flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" /> New Exam
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" /> Go Home
        </button>
      </div>
    </div>
  )
}
