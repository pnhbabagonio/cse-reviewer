import { CalendarDays, Clock, Target, Zap, Flame, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCountdown } from '../hooks/useCountdown'
import useSettingsStore from '../store/settingsStore'

const DEFAULT_EXAM_NAME = 'Civil Service Examination'

const getMessage = (days) => {
  if (days >= 90) return { 
    text: "You've got time, but don't let it slip away. Champions are made in the months nobody sees.", 
    icon: Target 
  }
  if (days >= 60) return { 
    text: "The days are still plenty — but only if you use them. Every session counts. Stay hungry.", 
    icon: Target 
  }
  if (days >= 30) return { 
    text: "One month left. No more excuses. The difference between pass and fail is built right now.", 
    icon: Zap 
  }
  if (days >= 14) return { 
    text: "Two weeks. The pressure is real — and that's exactly what will make you sharper. Push through.", 
    icon: Flame 
  }
  if (days >= 7) return { 
    text: "This is it. One week to sharpen your edge. Review your weaknesses. Leave nothing to chance.", 
    icon: Flame 
  }
  if (days >= 3) return { 
    text: "72 hours or less. Sleep well, review smart, and walk in knowing you gave everything.", 
    icon: Clock 
  }
  if (days >= 1) return { 
    text: "Tomorrow decides. You didn't come this far to only come this far. Trust your grind.", 
    icon: Trophy 
  }
  return { 
    text: "Today is YOUR day. Walk in with your head high — you've earned this moment. Go claim it. 🎉", 
    icon: Trophy 
  }
}

const getPressureColor = (days) => {
  if (days >= 60) return 'border-amber-400'
  if (days >= 30) return 'border-orange-400'
  if (days >= 14) return 'border-orange-500'
  if (days >= 7) return 'border-red-400'
  if (days >= 1) return 'border-red-500'
  return 'border-red-600'
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

function CountdownUnit({ value, label, padLength, urgent }) {
  return (
    <div className={`rounded-xl px-3 py-2 text-center min-w-[60px] transition-colors ${
      urgent 
        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
        : 'bg-white dark:bg-white/10'
    }`}>
      <div className={`text-3xl font-bold ${
        urgent ? 'text-red-600 dark:text-red-400' : 'text-[#1e3a5f] dark:text-white'
      }`}>
        {formatUnit(value, padLength)}
      </div>
      <div className={`text-xs uppercase tracking-wide mt-1 ${
        urgent ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
      }`}>
        {label}
      </div>
    </div>
  )
}

function CountdownPromptCard({ examName = DEFAULT_EXAM_NAME, isPast = false }) {
  const prompt = isPast ? 'Set your next Exam Date' : 'Set your Exam Date'
  const description = isPast
    ? 'Your saved exam date has passed. Don\'t lose momentum — set a new target and keep pushing forward.'
    : 'A goal without a deadline is just a wish. Set your exam date and let the countdown drive you.'

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
        className="mt-4 inline-flex w-full justify-center rounded-lg bg-[#1e3a5f] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#152a4a] transition-colors lg:mt-0 lg:w-auto"
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
  const { text: message, icon: MessageIcon } = getMessage(days)
  const isUrgent = days < 14
  const pressureColor = getPressureColor(days)

  if (isToday) {
    return (
      <div className={`w-full rounded-2xl p-5 border-l-4 ${pressureColor} bg-[#f0f4ff] dark:bg-[#0f1f35] text-center`}>
        <div className="flex justify-center mb-3">
          <Trophy className="w-8 h-8 text-gold" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-[#1e3a5f] dark:text-white">{examName}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{displayDate}</p>
        <p className="text-xl font-bold text-[#1e3a5f] dark:text-white mt-4 leading-relaxed">
          {message}
        </p>
      </div>
    )
  }

  return (
    <div className={`w-full rounded-2xl p-5 border-l-4 ${pressureColor} bg-[#f0f4ff] dark:bg-[#0f1f35] lg:flex lg:items-center lg:justify-between lg:gap-6`}>
      <div className="flex items-start gap-3">
        <CalendarDays className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold text-[#1e3a5f] dark:text-white">{examName}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{displayDate}</p>
          <div className="hidden lg:flex items-start gap-2 mt-3">
            <MessageIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-[#1e3a5f] dark:text-gray-100 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </div>

      <div className="my-4 h-px bg-blue-100 dark:bg-white/10 lg:hidden" />

      <div className="grid grid-cols-4 gap-2 lg:flex lg:gap-3">
        <CountdownUnit value={days} label="Days" padLength={3} urgent={isUrgent} />
        <CountdownUnit value={hours} label="Hrs" urgent={isUrgent} />
        <CountdownUnit value={minutes} label="Min" urgent={isUrgent} />
        <CountdownUnit value={seconds} label="Sec" urgent={isUrgent} />
      </div>

      <div className="mt-4 h-px bg-blue-100 dark:bg-white/10 lg:hidden" />
      <div className="flex items-start justify-center gap-2 mt-4 lg:hidden">
        <MessageIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-center text-sm font-medium text-[#1e3a5f] dark:text-gray-100 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  )
}

export default function CountdownCard() {
  const { examCountdown } = useSettingsStore()

  if (!examCountdown?.examDate) return <CountdownPromptCard />
  return <CountdownCardContent examCountdown={examCountdown} />
}