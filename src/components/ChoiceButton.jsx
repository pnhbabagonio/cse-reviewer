import FormattedText from './FormattedText'

export default function ChoiceButton({ letter, text, selected, isCorrect, isWrong, onClick, disabled }) {
  let bgColor = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  if (isCorrect) bgColor = 'bg-green-100 dark:bg-green-900/30 border-green-500'
  if (isWrong) bgColor = 'bg-red-100 dark:bg-red-900/30 border-red-500'
  if (selected && !isCorrect && !isWrong) bgColor = 'bg-navy/10 dark:bg-navy/30 border-navy'
  const interactiveClasses = disabled
    ? ''
    : 'hover:border-navy dark:hover:border-gold active:scale-[0.99]'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${bgColor} ${interactiveClasses}`}
    >
      <div className="flex gap-3">
        <span className="font-bold text-navy dark:text-gold w-6">{letter}</span>
        <FormattedText text={text} className="flex-1 whitespace-pre-wrap" />
      </div>
    </button>
  )
}
