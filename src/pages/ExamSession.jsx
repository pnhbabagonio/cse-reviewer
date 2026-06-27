import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useExamStore from '../store/examStore'
import useProgressStore from '../store/progressStore'
import useTimer from '../hooks/useTimer'
import { useStudyTimer } from '../hooks/useStudyTimer'
import QuestionCard from '../components/QuestionCard'
import ProgressBar from '../components/ProgressBar'
import PassagePanel from '../components/PassagePanel'
import Modal from '../components/Modal'
import { ArrowLeft, ArrowRight, Pause, Play, Clock, X } from 'lucide-react'


export default function ExamSession() {
  const navigate = useNavigate()
  const { session, currentQuestionIndex, setCurrentQuestionIndex, submitAnswer, completeSession, bookmarkQuestion, isBookmarked, clearSession } = useExamStore()
  const { addSession } = useProgressStore()
  const [isPaused, setIsPaused] = useState(false)
  const [showQuitModal, setShowQuitModal] = useState(false)
  const isTimed = session?.mode === 'timed'
  const { isPaused: isStudyTimerPaused } = useStudyTimer({
    categories: session?.categories ?? [],
  })

  useEffect(() => {
    if (!session) {
      navigate('/', { replace: true })
      return
    }
  }, [session, navigate])

  const currentQuestion = session?.questions[currentQuestionIndex]
  const totalQuestions = session?.questions.length || 0
  const selectedAnswer = session?.answers[currentQuestion?.id]

  // DEBUG: Track what's happening with selectedAnswer
  useEffect(() => {
    if (!session || !currentQuestion) return
    console.log('🔍 ExamSession state:', {
      currentQuestionId: currentQuestion.id,
      currentQuestionType: currentQuestion.type,
      currentQuestionSubcategory: currentQuestion.subcategory,
      currentQuestionAnswer: currentQuestion.answer,
      selectedAnswer: selectedAnswer,
      selectedAnswerType: typeof selectedAnswer,
      sessionAnswersKeys: Object.keys(session.answers),
      sessionAnswersFull: session.answers,
      mode: session.mode,
    })
  }, [currentQuestion?.id, session?.answers, session?.mode])

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

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
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
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1)
  }

  const handleQuit = () => {
    clearSession()
    navigate('/', { replace: true })
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
    <div className="w-full">
      <div className="max-w-2xl mx-auto space-y-4 lg:[&_.card>div.space-y-2]:grid lg:[&_.card>div.space-y-2]:grid-cols-2 lg:[&_.card>div.space-y-2]:gap-3 lg:[&_.card>div.space-y-2]:space-y-0">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <h2 className="text-lg font-semibold">CSE Exam</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuitModal(true)}
              className="p-2 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
              title="Quit exam"
            >
              <X className="w-5 h-5" />
            </button>
            {isTimed && (
              <>
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
                {isStudyTimerPaused && <span className="text-xs text-amber-500">Study paused</span>}
              </>
            )}
          </div>
        </div>

        <ProgressBar value={currentQuestionIndex + 1} max={totalQuestions} />

        {currentQuestion?.type === 'passage_question' && (
          <PassagePanel
            title={currentQuestion.passageTitle}
            passageText={currentQuestion.passageText}
            groupIndex={currentQuestion.groupIndex}
            groupSize={currentQuestion.groupSize}
          />
        )}

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
            disabled={currentQuestionIndex === 0}
            className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" /> Previous
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-2 rounded-lg bg-navy text-white"
          >
            {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </div>

      {/* Quit Confirmation Modal */}
      <Modal
        isOpen={showQuitModal}
        onClose={() => setShowQuitModal(false)}
        title="Quit Exam?"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to quit this exam? Your progress will not be saved.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowQuitModal(false)}
              className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleQuit}
              className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Quit Exam
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}