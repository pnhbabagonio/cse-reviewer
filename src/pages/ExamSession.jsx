import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useExamStore from '../store/examStore'
import useProgressStore from '../store/progressStore'
import useTimer from '../hooks/useTimer'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'
import { ArrowLeft, ArrowRight, Pause, Play, Clock } from 'lucide-react'

export default function ExamSession() {
  const navigate = useNavigate()
  const { session, submitAnswer, completeSession, bookmarkQuestion, isBookmarked } = useExamStore()
  const { addSession } = useProgressStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const isTimed = session?.mode === 'timed'

  useEffect(() => {
    if (!session) {
      navigate('/', { replace: true })
      return
    }
  }, [session, navigate])

  const currentQuestion = session?.questions[currentIndex]
  const totalQuestions = session?.questions.length || 0
  const selectedAnswer = session?.answers[currentQuestion?.id]

  const handleSelectAnswer = (answer) => {
    if (!session || !currentQuestion) return

    if (isTimed) {
      submitAnswer(currentQuestion.id, answer)
    } else {
      // Practice mode: immediate feedback + auto-advance after delay?
      submitAnswer(currentQuestion.id, answer)
      // Automatically show next after 1 second? Or keep as is with Next button
    }
  }

  const handleNext = () => {
    if (!session) return

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Complete exam
      const completedSession = completeSession()
      if (completedSession) {
        addSession(completedSession)
        navigate('/results', { state: { session: completedSession } })
      }
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  const timePerQuestion = 1.5 * 60 // 1.5 minutes in seconds
  const totalDuration = totalQuestions * timePerQuestion
  const { timeLeft, isRunning, pause, resume } = useTimer({
    durationSeconds: totalDuration,
    onExpire: () => {
      const completedSession = completeSession()
      if (completedSession) {
        addSession(completedSession)
        navigate('/results', { state: { session: completedSession } })
      }
    },
    autoStart: isTimed && !isPaused,
  })

  useEffect(() => {
    if (!isTimed) return

    if (isPaused) pause()
    else resume()
  }, [isPaused, isTimed, pause, resume])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!session || !currentQuestion) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-20">
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Question {currentIndex + 1} of {totalQuestions}</span>
            <h2 className="text-lg font-semibold">CSE Exam</h2>
          </div>
          {isTimed && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <div className={`flex items-center gap-1 font-mono text-lg ${timeLeft < 120 ? 'text-red-600' : ''}`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            </div>
          )}
        </div>

        <ProgressBar value={currentIndex + 1} max={totalQuestions} />

        <QuestionCard
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={handleSelectAnswer}
          mode={session.mode}
          showExplanation={session.mode === 'practice' && selectedAnswer}
          isBookmarked={isBookmarked(currentQuestion.id)}
          onToggleBookmark={() => bookmarkQuestion(currentQuestion.id)}
        />

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" /> Previous
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-2 rounded-lg bg-navy text-white"
          >
            {currentIndex === totalQuestions - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}
