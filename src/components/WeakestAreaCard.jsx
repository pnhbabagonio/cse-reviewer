import { Target, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SUBCATEGORY_LABELS = {
  'verbal::alphabetizing': 'Alphabetizing',
  'verbal::synonyms': 'Synonyms',
  'verbal::antonyms': 'Antonyms',
  'verbal::analogy': 'Analogy (Single Word)',
  'verbal::analogy_double': 'Analogy (Double Word)',
  'verbal::identifying_errors': 'Identifying Errors',
  'verbal::paragraph_organization': 'Paragraph Organization',
  'verbal::reading_comprehension': 'Reading Comprehension',
  'analytical::data_sufficiency': 'Data Sufficiency',
  'analytical::pattern_recognition': 'Pattern Recognition',
  'analytical::abstract_reasoning': 'Abstract Reasoning',
  'analytical::logic': 'Logic',
  'numerical::basic_arithmetic': 'Basic Arithmetic',
  'numerical::word_problems': 'Word Problems',
  'numerical::algebra': 'Algebra',
  'numerical::geometry': 'Geometry',
  'general_info::philippine_constitution': 'Philippine Constitution',
  'general_info::philippine_history': 'Philippine History',
  'general_info::philippine_government': 'Philippine Government',
  'general_info::current_events': 'Current Events',
  'general_info::environment': 'Environment',
  'filipino::gramatika': 'Gramatika',
  'filipino::talasalitaan': 'Talasalitaan',
  'filipino::pagbasa': 'Pagbasa',
  'filipino::kasingkahulugan': 'Kasingkahulugan',
  'filipino::kasalungat': 'Kasalungat',
}

const getAccuracyColor = (accuracy) => {
  if (accuracy < 40) return 'text-red-600 dark:text-red-400'
  if (accuracy < 70) return 'text-amber-600 dark:text-amber-400'
  return 'text-yellow-600 dark:text-yellow-400'
}

export default function WeakestAreaCard({ weakest }) {
  const navigate = useNavigate()

  if (!weakest) return null

  const label = SUBCATEGORY_LABELS[weakest.key] || weakest.subcategory || weakest.key
  const accuracyColor = getAccuracyColor(weakest.accuracy)

  const handlePractice = () => {
    navigate('/setup', {
      state: {
        mode: 'practice',
        categories: [weakest.category],
        subcategoryKeys: [weakest.key],
      },
    })
  }

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${weakest.accuracy < 40 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
            }`}>
            <Target className={`w-5 h-5 ${accuracyColor}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Weakest Area
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {label}
            </p>
            <p className={`text-xs font-medium ${accuracyColor}`}>
              {weakest.correct}/{weakest.total} correct — {Math.round(weakest.accuracy)}%
            </p>
          </div>
        </div>
        <button
          onClick={handlePractice}
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#1e3a5f] px-3 py-2 text-xs font-medium text-white hover:bg-[#152a4a] transition-colors"
        >
          Practice
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}