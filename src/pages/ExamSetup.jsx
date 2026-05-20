import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useExamStore from '../store/examStore'

const categories = [
  { id: 'verbal', label: 'Verbal' },
  { id: 'analytical', label: 'Analytical' },
  { id: 'numerical', label: 'Numerical' },
  { id: 'general_info', label: 'General Info' },
  { id: 'filipino', label: 'Filipino' },
]

const questionCounts = [10, 20, 30, 50, 100]
const difficulties = ['all', 'easy', 'average', 'difficult']

export default function ExamSetup() {
  const location = useLocation()
  const navigate = useNavigate()
  const mode = location.state?.mode || 'timed'
  const retryWrongIds = location.state?.wrongQuestionIds || null

  const { allQuestions, startSession } = useExamStore()

  const [selectedCategories, setSelectedCategories] = useState(categories.map(c => c.id))
  const [difficulty, setDifficulty] = useState('all')
  const [questionCount, setQuestionCount] = useState(30)
  const [availableCount, setAvailableCount] = useState(0)

  // Filter questions based on selection
  useEffect(() => {
    let filtered = allQuestions
    if (retryWrongIds) {
      filtered = allQuestions.filter(q => retryWrongIds.includes(q.id))
    } else {
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(q => selectedCategories.includes(q.category))
      }
      if (difficulty !== 'all') {
        filtered = filtered.filter(q => q.difficulty === difficulty)
      }
    }
    setAvailableCount(filtered.length)
    // Auto-adjust question count if needed
    const maxAvailable = Math.min(questionCount, filtered.length)
    if (maxAvailable < questionCount && filtered.length > 0) {
      setQuestionCount(filtered.length)
    }
  }, [selectedCategories, difficulty, allQuestions, retryWrongIds, questionCount])

  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return // Keep at least one
      setSelectedCategories(selectedCategories.filter(c => c !== catId))
    } else {
      setSelectedCategories([...selectedCategories, catId])
    }
  }

  const handleStart = () => {
    const config = {
      mode,
      categories: selectedCategories,
      difficulty: difficulty === 'all' ? null : difficulty,
      questionCount,
      retryWrongIds: retryWrongIds || null,
    }
    const startedSession = startSession(config)
    if (startedSession) navigate('/exam')
  }

  const timerPreview = mode === 'timed' ? questionCount * 1.5 : 0
  const minutes = Math.floor(timerPreview)
  const seconds = Math.round((timerPreview - minutes) * 60)
  const customQuestionCount = availableCount > 0 && !questionCounts.includes(questionCount)

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Exam Setup</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {mode === 'timed' ? '⏱️ Timed Exam' : '📚 Practice Mode'}
        </p>
      </div>

      {retryWrongIds && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
          🔄 Retrying only your previously wrong answers ({retryWrongIds.length} questions)
        </div>
      )}

      {/* Categories */}
      <div className="space-y-2">
        <label className="font-semibold">Categories</label>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategories.includes(cat.id)
                  ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="font-semibold">Difficulty</label>
        <div className="flex flex-wrap gap-2">
          {difficulties.map(diff => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                difficulty === diff
                  ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Question Count */}
      <div className="space-y-2">
        <label className="font-semibold">Number of Questions</label>
        <div className="flex flex-wrap gap-2">
          {questionCounts.map(count => (
            <button
              key={count}
              onClick={() => setQuestionCount(count)}
              disabled={count > availableCount}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                questionCount === count
                  ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              } ${count > availableCount ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {count}
            </button>
          ))}
          {customQuestionCount && (
            <button
              type="button"
              className="px-4 py-1.5 rounded-full text-sm font-medium bg-navy text-white dark:bg-gold dark:text-navy"
            >
              {questionCount}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">{availableCount} questions available</p>
      </div>

      {/* Timer Preview */}
      {mode === 'timed' && (
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Estimated time</p>
          <p className="text-2xl font-bold text-navy dark:text-gold">
            {minutes}:{seconds.toString().padStart(2, '0')} minutes
          </p>
          <p className="text-xs text-gray-500">1.5 mins per question (CSC standard)</p>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={availableCount === 0}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {mode === 'practice' ? 'Start Practice' : 'Start Exam'}
      </button>
    </div>
  )
}
