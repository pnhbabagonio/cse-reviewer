import { useNavigate } from 'react-router-dom'
import useExamStore from '../store/examStore'
import QuestionCard from '../components/QuestionCard'

export default function Bookmarks() {
  const navigate = useNavigate()
  const { allQuestions, bookmarks, bookmarkQuestion, isBookmarked } = useExamStore()
  const bookmarkedQuestions = allQuestions.filter(q => bookmarks.includes(q.id))

  const startPractice = () => {
    const wrongQuestionIds = bookmarkedQuestions.map(q => q.id)
    navigate('/setup', { state: { mode: 'practice', wrongQuestionIds } })
  }

  if (bookmarkedQuestions.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🔖</div>
        <h2 className="text-xl font-bold mb-2">No Bookmarks Yet</h2>
        <p className="text-gray-500 mb-6">Bookmark questions during exams to review them later.</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-navy dark:text-white">Bookmarked Questions</h1>
        <button onClick={startPractice} className="btn-primary text-sm px-4 py-2">Practice All</button>
      </div>
      <div className="space-y-4">
        {bookmarkedQuestions.map(question => (
          <QuestionCard
            key={question.id}
            question={question}
            mode="review"
            isBookmarked={true}
            onToggleBookmark={() => bookmarkQuestion(question.id)}
            selectedAnswer={null}
            onSelectAnswer={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
