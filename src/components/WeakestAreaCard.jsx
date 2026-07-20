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

const CATEGORY_CONFIG = {
  verbal: { label: 'Verbal', color: 'bg-blue-500', border: 'border-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  analytical: { label: 'Analytical', color: 'bg-purple-500', border: 'border-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  numerical: { label: 'Numerical', color: 'bg-green-500', border: 'border-green-400', bg: 'bg-green-50 dark:bg-green-950/20' },
  general_info: { label: 'General Info', color: 'bg-orange-500', border: 'border-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  filipino: { label: 'Filipino', color: 'bg-red-500', border: 'border-red-400', bg: 'bg-red-50 dark:bg-red-950/20' },
}

const getMessage = (accuracy) => {
  if (accuracy < 30) return "This is your biggest opportunity. Every minute you spend here directly translates to more points on exam day."
  if (accuracy < 50) return "You're leaving easy points on the table. A few focused sessions here could change your score."
  if (accuracy < 70) return "You're close, but close doesn't pass the CSE. Lock this down."
  return "This area needs polish. Don't let it be the reason you fall short."
}

export default function WeakestAreaCard({ weakest }) {
  const navigate = useNavigate()

  if (!weakest) return null

  const label = SUBCATEGORY_LABELS[weakest.key] || weakest.subcategory || weakest.key
  const catConfig = CATEGORY_CONFIG[weakest.category] || CATEGORY_CONFIG.verbal
  const message = getMessage(weakest.accuracy)

  const handlePractice = () => {
    const subcategoryKey = weakest.key
    navigate('/setup', {
      state: {
        mode: 'practice',
        categories: [weakest.category],
        subcategoryKeys: [subcategoryKey],
      },
    })
  }

  return (
    <div className={`rounded-2xl p-5 border-l-4 ${catConfig.border} ${catConfig.bg}`}>
      <div className="flex items-start gap-3 mb-3">
        <Target className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Weakest Area
          </h3>
          <p className="text-lg font-bold text-[#1e3a5f] dark:text-white mt-1">
            {label}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {weakest.correct}/{weakest.total} correct — {Math.round(weakest.accuracy)}% accuracy
          </p>
          <p className="text-sm font-medium text-[#1e3a5f] dark:text-gray-100 mt-3 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <button
        onClick={handlePractice}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#1e3a5f] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#152a4a] transition-colors"
      >
        Practice {label}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}