import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import useExamStore from '../store/examStore'

export default function AnswerReview() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const session = state?.session
  const { allQuestions, bookmarkQuestion, isBookmarked } = useExamStore()
  const [filter, setFilter] = useState('all')
  const [selectedIndex, setSelectedIndex] = useState(0)

  let reviewQuestions = session
    ? session.results.map(r => {
      const q = allQuestions.find(q => q.id === r.questionId)
      return q ? { ...q, userAnswer: r.userAnswer, isCorrect: r.isCorrect } : null
    }).filter(Boolean)
    : []

  if (filter === 'correct') reviewQuestions = reviewQuestions.filter(q => q.isCorrect)
  if (filter === 'incorrect') reviewQuestions = reviewQuestions.filter(q => !q.isCorrect)
  if (filter === 'bookmarked') reviewQuestions = reviewQuestions.filter(q => isBookmarked(q.id))

  useEffect(() => {
    setSelectedIndex(0)
  }, [filter])

  useEffect(() => {
    if (selectedIndex >= reviewQuestions.length) {
      setSelectedIndex(0)
    }
  }, [reviewQuestions.length, selectedIndex])

  if (!session) {
    return <Navigate to="/" replace />
  }

  const QuestionReviewCard = ({ question }) => (
    <div className="card">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs font-bold px-2 py-1 rounded ${question.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {question.isCorrect ? 'Correct' : 'Incorrect'}
        </span>
        <button
          onClick={() => bookmarkQuestion(question.id)}
          className="text-sm text-gold"
        >
          {isBookmarked(question.id) ? 'Bookmarked' : 'Bookmark'}
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
  )

  const FilterChips = () => (
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
  )

  return (
    <div className="w-full space-y-4 lg:space-y-0">
      <div className="flex justify-between items-center lg:mb-4">
        <h1 className="text-2xl font-bold text-navy dark:text-white">Answer Review</h1>
        <button onClick={() => navigate(-1)} className="text-sm text-gold">Back</button>
      </div>

      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-0 lg:h-[calc(100vh-160px)] bg-transparent lg:bg-white lg:dark:bg-gray-900 lg:rounded-xl lg:shadow-md lg:overflow-hidden">
        <div className="lg:overflow-y-auto lg:border-r lg:border-gray-200 lg:dark:border-gray-700">
          <div className="sticky top-0 bg-white dark:bg-gray-900 p-3 border-b border-gray-200 dark:border-gray-700 z-10">
            <FilterChips />
          </div>

          <div className="hidden lg:block">
            {reviewQuestions.length === 0 && (
              <div className="p-4 text-sm text-gray-500">
                No reviewable questions were found in the current question bank.
              </div>
            )}
            {reviewQuestions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setSelectedIndex(index)}
                className={`w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 ${
                  selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${question.isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="min-w-0">
                  <span className="block text-xs text-gray-500">Question {index + 1}</span>
                  <span className="block text-sm truncate">{question.question.slice(0, 80)}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="lg:hidden space-y-4 p-4">
            {reviewQuestions.length === 0 && (
              <div className="card text-center text-gray-500">
                No reviewable questions were found in the current question bank.
              </div>
            )}
            {reviewQuestions.map(question => (
              <QuestionReviewCard key={question.id} question={question} />
            ))}
          </div>
        </div>

        <div className="hidden lg:block lg:overflow-y-auto p-6">
          {reviewQuestions[selectedIndex] && (
            <QuestionReviewCard question={reviewQuestions[selectedIndex]} />
          )}
        </div>
      </div>
    </div>
  )
}
