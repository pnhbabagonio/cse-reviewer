import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import useExamStore from '../store/examStore'

export default function AnswerReview() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const session = state?.session
  const { allQuestions, bookmarkQuestion, isBookmarked } = useExamStore()
  const [filter, setFilter] = useState('all') // all, correct, incorrect, bookmarked

  if (!session) {
    return <Navigate to="/" replace />
  }

  let reviewQuestions = session.results.map(r => {
    const q = allQuestions.find(q => q.id === r.questionId)
    return q ? { ...q, userAnswer: r.userAnswer, isCorrect: r.isCorrect } : null
  }).filter(Boolean)

  if (filter === 'correct') reviewQuestions = reviewQuestions.filter(q => q.isCorrect)
  if (filter === 'incorrect') reviewQuestions = reviewQuestions.filter(q => !q.isCorrect)
  if (filter === 'bookmarked') reviewQuestions = reviewQuestions.filter(q => isBookmarked(q.id))

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-navy dark:text-white">Answer Review</h1>
        <button onClick={() => navigate(-1)} className="text-sm text-gold">Back</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'correct', 'incorrect', 'bookmarked'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm capitalize ${filter === f ? 'bg-navy text-white' : 'bg-gray-200 dark:bg-gray-800'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {reviewQuestions.length === 0 && (
          <div className="card text-center text-gray-500">
            No reviewable questions were found in the current question bank.
          </div>
        )}
        {reviewQuestions.map(question => (
          <div key={question.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${question.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {question.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </span>
              <button
                onClick={() => bookmarkQuestion(question.id)}
                className="text-sm text-gold"
              >
                {isBookmarked(question.id) ? '★ Bookmarked' : '☆ Bookmark'}
              </button>
            </div>
            <p className="font-medium mb-3">{question.question}</p>
            <div className="space-y-1 text-sm">
              {Object.entries(question.choices).map(([key, text]) => {
                let className = ''
                if (key === question.answer) className = 'bg-green-100 dark:bg-green-900/30 border-green-500'
                else if (key === question.userAnswer && key !== question.answer) className = 'bg-red-100 dark:bg-red-900/30 border-red-500'
                else className = 'bg-gray-50 dark:bg-gray-800'
                return (
                  <div key={key} className={`p-2 rounded border ${className}`}>
                    <strong>{key.toUpperCase()}</strong> {text}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
              <span className="font-semibold">Explanation:</span> {question.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
