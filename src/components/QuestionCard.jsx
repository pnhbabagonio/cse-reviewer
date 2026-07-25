import ChoiceButton from './ChoiceButton'
import CategoryBadge from './CategoryBadge'
import DifficultyBadge from './DifficultyBadge'
import SubcategoryBadge from './SubcategoryBadge'
import FormattedText from './FormattedText'
import FlagButton from './FlagButton'
import { Bookmark, BookmarkCheck } from 'lucide-react'

export default function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  mode,
  showExplanation = false,
  isBookmarked,
  onToggleBookmark,
}) {
  const isCorrect = selectedAnswer && selectedAnswer === question.answer

  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex gap-2 flex-wrap">
          <CategoryBadge category={question.category} />
          <SubcategoryBadge subcategory={question.subcategory} />
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
        <div className="flex items-center gap-1">
          <FlagButton questionId={question.id} />
          <button
            onClick={onToggleBookmark}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-gold" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {(question.subcategory === 'synonym' || question.subcategory === 'synonyms' || question.subcategory === 'kasingkahulugan') && (
        <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-1.5">
          <span>🔵</span>
          <span className="font-medium">Find the word with the SAME meaning</span>
        </div>
      )}

      {(question.subcategory === 'antonym' || question.subcategory === 'antonyms' || question.subcategory === 'kasalungat') && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-1.5">
          <span>🔴</span>
          <span className="font-medium">Find the word with the OPPOSITE meaning</span>
        </div>
      )}

      <FormattedText text={question.question} className="text-lg font-medium leading-relaxed whitespace-pre-wrap" as="div" />

      <div className="space-y-2">
        {Object.entries(question.choices).map(([key, value]) => (
          <ChoiceButton
            key={key}
            letter={key.toUpperCase()}
            text={value}
            selected={selectedAnswer === key}
            isCorrect={mode === 'practice' && showExplanation && key === question.answer}
            isWrong={mode === 'practice' && showExplanation && selectedAnswer === key && key !== question.answer}
            onClick={() => onSelectAnswer(key)}
            disabled={mode === 'practice' && showExplanation}
          />
        ))}
      </div>

      {mode === 'practice' && showExplanation && (
        <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
          <p className="font-semibold mb-1">{isCorrect ? '✅ Correct!' : '❌ Incorrect'}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}