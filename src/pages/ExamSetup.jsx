import { useState, useEffect, useMemo } from 'react'
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

const getSubcategoryKey = (question) => (
  `${question.category}::${question.subcategory || 'uncategorized'}`
)

const formatSubcategory = (value) => (
  (value || 'uncategorized')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
)

export default function ExamSetup() {
  const location = useLocation()
  const navigate = useNavigate()
  const mode = location.state?.mode || 'timed'
  const retryWrongIds = location.state?.wrongQuestionIds || null

  const { allQuestions, startSession } = useExamStore()

  const [selectedCategories, setSelectedCategories] = useState(categories.map(c => c.id))
  const [selectedSubcategoryKeys, setSelectedSubcategoryKeys] = useState([])
  const [difficulty, setDifficulty] = useState('all')
  const [questionCount, setQuestionCount] = useState(30)
  const [answerAll, setAnswerAll] = useState(false)
  const [availableCount, setAvailableCount] = useState(0)

  const categoryCounts = useMemo(() => {
    return categories.reduce((counts, category) => {
      counts[category.id] = allQuestions.filter(q => q.category === category.id).length
      return counts
    }, {})
  }, [allQuestions])

  const subcategoryGroups = useMemo(() => {
    return categories
      .filter(category => selectedCategories.includes(category.id))
      .map(category => {
        const counts = new Map()
        allQuestions.forEach(question => {
          if (question.category !== category.id) return
          const subcategory = question.subcategory || 'uncategorized'
          counts.set(subcategory, (counts.get(subcategory) || 0) + 1)
        })

        return {
          ...category,
          total: categoryCounts[category.id] || 0,
          subcategories: Array.from(counts, ([id, total]) => ({
            id,
            key: `${category.id}::${id}`,
            label: formatSubcategory(id),
            total,
          })),
        }
      })
      .filter(group => group.subcategories.length > 0)
  }, [allQuestions, categoryCounts, selectedCategories])

  useEffect(() => {
    setSelectedSubcategoryKeys(currentKeys => (
      currentKeys.filter(key => selectedCategories.includes(key.split('::')[0]))
    ))
  }, [selectedCategories])

  useEffect(() => {
    let filtered = allQuestions
    if (retryWrongIds) {
      filtered = allQuestions.filter(q => retryWrongIds.includes(q.id))
    } else {
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(q => selectedCategories.includes(q.category))
      }
      if (selectedSubcategoryKeys.length > 0) {
        filtered = filtered.filter(q => selectedSubcategoryKeys.includes(getSubcategoryKey(q)))
      }
      if (difficulty !== 'all') {
        filtered = filtered.filter(q => q.difficulty === difficulty)
      }
    }
    setAvailableCount(filtered.length)
    
    if (answerAll) {
      setQuestionCount(filtered.length)
    } else {
      const maxAvailable = Math.min(questionCount, filtered.length)
      if (maxAvailable < questionCount && filtered.length > 0) {
        setQuestionCount(filtered.length)
      }
    }
  }, [selectedCategories, selectedSubcategoryKeys, difficulty, allQuestions, retryWrongIds, answerAll, questionCount])

  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return
      setSelectedCategories(selectedCategories.filter(c => c !== catId))
    } else {
      setSelectedCategories([...selectedCategories, catId])
    }
  }

  const toggleSubcategory = (key) => {
    setSelectedSubcategoryKeys(currentKeys => (
      currentKeys.includes(key)
        ? currentKeys.filter(currentKey => currentKey !== key)
        : [...currentKeys, key]
    ))
  }

  const handleStart = () => {
    const config = {
      mode,
      categories: selectedCategories,
      subcategoryKeys: selectedSubcategoryKeys,
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
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Exam Setup</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {mode === 'timed' ? 'Timed Exam' : 'Practice Mode'}
        </p>
      </div>

      {retryWrongIds && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
          Retrying only your previously wrong answers ({retryWrongIds.length} questions)
        </div>
      )}

      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="font-semibold">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-white/20 dark:bg-navy/10'
                      : 'bg-white dark:bg-gray-700'
                  }`}>
                    {categoryCounts[cat.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {!retryWrongIds && subcategoryGroups.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="font-semibold">Subcategories</label>
                {selectedSubcategoryKeys.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSubcategoryKeys([])}
                    className="text-xs font-medium text-gold"
                  >
                    All
                  </button>
                )}
              </div>

              {subcategoryGroups.map(group => (
                <div key={group.id} className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {group.label} ({group.total})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.subcategories.map(subcategory => {
                      const isSelected = selectedSubcategoryKeys.includes(subcategory.key)
                      return (
                        <button
                          key={subcategory.key}
                          type="button"
                          onClick={() => toggleSubcategory(subcategory.key)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span>{subcategory.label}</span>
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-white/20 dark:bg-navy/10'
                              : 'bg-white dark:bg-gray-700'
                          }`}>
                            {subcategory.total}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 mt-6 lg:mt-0">
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

          <div className="space-y-2">
            <label className="font-semibold">Number of Questions</label>
            <div className="flex flex-wrap gap-2">
              <button
                key="all"
                onClick={() => {
                  setAnswerAll(true)
                  setQuestionCount(availableCount)
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  answerAll
                    ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                All
              </button>
              {questionCounts.map(count => (
                <button
                  key={count}
                  onClick={() => {
                    setAnswerAll(false)
                    setQuestionCount(count)
                  }}
                  disabled={count > availableCount}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    !answerAll && questionCount === count
                      ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  } ${count > availableCount ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {count}
                </button>
              ))}
              {customQuestionCount && !answerAll && (
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

          {mode === 'timed' && (
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Estimated time</p>
              <p className="text-2xl font-bold text-navy dark:text-gold">
                {minutes}:{seconds.toString().padStart(2, '0')} minutes
              </p>
              <p className="text-xs text-gray-500">1.5 mins per question (CSC standard)</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={availableCount === 0}
        className="w-full lg:max-w-xs lg:mx-auto mt-6 block btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {mode === 'practice' ? 'Start Practice' : 'Start Exam'}
      </button>
    </div>
  )
}
