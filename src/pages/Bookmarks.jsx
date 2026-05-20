import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useExamStore from '../store/examStore'
import QuestionCard from '../components/QuestionCard'

export default function Bookmarks() {
  const navigate = useNavigate()
  const { allQuestions, bookmarks, bookmarkQuestion, isBookmarked } = useExamStore()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const bookmarkedQuestions = allQuestions.filter(q => bookmarks.includes(q.id))

  useEffect(() => {
    if (selectedIndex >= bookmarkedQuestions.length) {
      setSelectedIndex(0)
    }
  }, [bookmarkedQuestions.length, selectedIndex])

  const startPractice = () => {
    const wrongQuestionIds = bookmarkedQuestions.map(q => q.id)
    navigate('/setup', { state: { mode: 'practice', wrongQuestionIds } })
  }

  if (bookmarkedQuestions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 text-center">
        <div className="text-6xl mb-4">Bookmarks</div>
        <h2 className="text-xl font-bold mb-2">No Bookmarks Yet</h2>
        <p className="text-gray-500 mb-6">Bookmark questions during exams to review them later.</p>
      </div>
    )
  }

  const QuestionDetail = ({ question }) => (
    <QuestionCard
      question={question}
      mode="review"
      isBookmarked={true}
      onToggleBookmark={() => bookmarkQuestion(question.id)}
      selectedAnswer={null}
      onSelectAnswer={() => {}}
    />
  )

  return (
    <div className="w-full space-y-4 lg:space-y-0">
      <div className="flex justify-between items-center lg:mb-4">
        <h1 className="text-2xl font-bold text-navy dark:text-white">Bookmarked Questions</h1>
        <button onClick={startPractice} className="btn-primary text-sm px-4 py-2 lg:hidden">Practice All</button>
      </div>

      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-0 lg:h-[calc(100vh-160px)] bg-transparent lg:bg-white lg:dark:bg-gray-900 lg:rounded-xl lg:shadow-md lg:overflow-hidden">
        <div className="lg:overflow-y-auto lg:border-r lg:border-gray-200 lg:dark:border-gray-700">
          <div className="hidden lg:block sticky top-0 bg-white dark:bg-gray-900 p-3 border-b border-gray-200 dark:border-gray-700 z-10">
            <button onClick={startPractice} className="w-full btn-primary text-sm px-4 py-2">
              Practice All Bookmarks
            </button>
          </div>

          <div className="hidden lg:block">
            {bookmarkedQuestions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setSelectedIndex(index)}
                className={`w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${
                  selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className="block text-xs text-gray-500">Question {index + 1}</span>
                <span className="block text-sm truncate">{question.question.slice(0, 80)}</span>
              </button>
            ))}
          </div>

          <div className="lg:hidden space-y-4 p-4">
            {bookmarkedQuestions.map(question => (
              <QuestionDetail key={question.id} question={question} />
            ))}
          </div>
        </div>

        <div className="hidden lg:block lg:overflow-y-auto p-6">
          {bookmarkedQuestions[selectedIndex] && (
            <QuestionDetail question={bookmarkedQuestions[selectedIndex]} />
          )}
        </div>
      </div>
    </div>
  )
}
