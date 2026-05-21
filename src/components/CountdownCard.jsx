import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCountdown } from '../hooks/useCountdown'
import useSettingsStore from '../store/settingsStore'

const DEFAULT_EXAM_NAME = 'Civil Service Examination'

const getMessage = (days) => {
  if (days >= 60) return 'You have plenty of time — stay consistent!'
  if (days >= 30) return 'Keep the momentum going!'
  if (days >= 14) return 'The exam is coming — push harder!'
  if (days >= 7) return 'Final stretch — review your weak areas!'
  if (days >= 1) return 'Almost there — trust your preparation!'
  return "Good luck on your exam today! You've got this! 🎉"
}

const formatDisplayDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatUnit = (value, padLength = 2) => String(value).padStart(padLength, '0')

function CountdownUnit({ value, label, padLength }) {
  return (
    <div className="bg-white dark:bg-white/10 rounded-xl px-3 py-2 text-center min-w-[60px]">
      <div className="text-3xl font-bold text-[#1e3a5f] dark:text-white">
        {formatUnit(value, padLength)}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
        {label}
      </div>
    </div>
  )
}

function CountdownPromptCard({ examName = DEFAULT_EXAM_NAME, isPast = false }) {
  const prompt = isPast ? 'Set your next Exam Date' : 'Set your Exam Date'
  const description = isPast
    ? 'Your saved exam date has passed. Pick a new date to start a fresh countdown.'
    : 'Choose your examination date in Settings to start your countdown.'

  return (
    <div className="w-full rounded-2xl p-5 border-l-4 border-amber-400 bg-[#f0f4ff] dark:bg-[#0f1f35] lg:flex lg:items-center lg:justify-between lg:gap-6">
      <div className="flex items-start gap-3">
        <CalendarDays className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-[#1e3a5f] dark:text-white">{examName}</h2>
          <p className="text-lg font-semibold text-[#1e3a5f] dark:text-white mt-2">{prompt}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
        </div>
      </div>

      <Link
        to="/settings"
        className="mt-4 inline-flex w-full justify-center rounded-lg bg-[#1e3a5f] px-4 py-2.5 text-sm font-medium text-white lg:mt-0 lg:w-auto"
      >
        Open Settings
      </Link>
    </div>
  )
}

function CountdownCardContent({ examCountdown }) {
  const { days, hours, minutes, seconds, isToday, isPast } = useCountdown(examCountdown.examDate)

  const examName = examCountdown.examName || DEFAULT_EXAM_NAME

  if (isPast) return <CountdownPromptCard examName={examName} isPast />

  const displayDate = formatDisplayDate(examCountdown.examDate)
  const message = getMessage(days)

  if (isToday) {
    return (
      <div className="w-full rounded-2xl p-5 border-l-4 border-amber-400 bg-[#f0f4ff] dark:bg-[#0f1f35] text-center">
        <div className="flex justify-center mb-3">
          <CalendarDays className="w-6 h-6 text-amber-500" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-[#1e3a5f] dark:text-white">{examName}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{displayDate}</p>
        <p className="text-lg font-semibold text-[#1e3a5f] dark:text-white mt-4">{message}</p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl p-5 border-l-4 border-amber-400 bg-[#f0f4ff] dark:bg-[#0f1f35] lg:flex lg:items-center lg:justify-between lg:gap-6">
      <div className="flex items-start gap-3">
        <CalendarDays className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-[#1e3a5f] dark:text-white">{examName}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{displayDate}</p>
          <p className="hidden lg:block text-sm font-medium text-[#1e3a5f] dark:text-gray-100 mt-3">
            {message}
          </p>
        </div>
      </div>

      <div className="my-4 h-px bg-blue-100 dark:bg-white/10 lg:hidden" />

      <div className="grid grid-cols-4 gap-2 lg:flex lg:gap-3">
        <CountdownUnit value={days} label="Days" padLength={3} />
        <CountdownUnit value={hours} label="Hrs" />
        <CountdownUnit value={minutes} label="Min" />
        <CountdownUnit value={seconds} label="Sec" />
      </div>

      <div className="mt-4 h-px bg-blue-100 dark:bg-white/10 lg:hidden" />
      <p className="text-center text-sm font-medium text-[#1e3a5f] dark:text-gray-100 mt-4 lg:hidden">
        {message}
      </p>
    </div>
  )
}

export default function CountdownCard() {
  const { examCountdown } = useSettingsStore()

  if (!examCountdown?.examDate) return <CountdownPromptCard />
  return <CountdownCardContent examCountdown={examCountdown} />
}
