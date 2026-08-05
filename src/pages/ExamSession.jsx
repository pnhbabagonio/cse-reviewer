import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useExamStore from '../store/examStore'
import useProgressStore from '../store/progressStore'
import useTimer from '../hooks/useTimer'
import { useStudyTimer } from '../hooks/useStudyTimer'
import QuestionCard from '../components/QuestionCard'
import QuestionImage from '../components/QuestionImage'
import ProgressBar from '../components/ProgressBar'
import PassagePanel from '../components/PassagePanel'
import Modal from '../components/Modal'
import { ArrowLeft, ArrowRight, Pause, Play, Clock, X, Keyboard } from 'lucide-react'

const KEYBOARD_HINT_KEY = 'cse_keyboard_hint_dismissed'

const KEY_MAP = {
  '1': 'a',
  '2': 'b',
  '3': 'c',
  '4': 'd',
  '5': 'e',
}

export default function ExamSession() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, currentQuestionIndex, setCurrentQuestionIndex, submitAnswer, completeSession, bookmarkQuestion, isBookmarked, clearSession, startSession } = useExamStore()
  const { addSession } = useProgressStore()
  const [isPaused, setIsPaused] = useState(false)
  const [showQuitModal, setShowQuitModal] = useState(false)
  const [showKeyboardHint, setShowKeyboardHint] = useState(false)
  const isTimed = session?.mode === 'timed'
  const isSimulator = session?.mode === 'simulator'
  const { isPaused: isStudyTimerPaused } = useStudyTimer({
    categories: session?.categories ?? [],
  })

  // Show keyboard hint on first exam ever
  useEffect(() => {
    const dismissed = localStorage.getItem(KEYBOARD_HINT_KEY)
    if (!dismissed && session) {
      setShowKeyboardHint(true)
    }
  }, [session])

  // Auto-start simulator if navigated directly with config
  useEffect(() => {
    if (!session && location.state?.mode === 'simulator') {
      const config = {
        mode: location.state.mode,
        categories: location.state.categories,
        difficulty: 'all',
        questionCount: location.state.questionCount || 150,
        retryWrongIds: null,
        subcategoryKeys: [],
      }
      startSession(config)
    }
  }, [session, location.state, startSession])

  useEffect(() => {
    if (!session) {
      navigate('/', { replace: true })
      return
    }
  }, [session, navigate])

  const currentQuestion = session?.questions[currentQuestionIndex]
  const totalQuestions = session?.questions.length || 0
  const selectedAnswer = session?.answers[currentQuestion?.id]

  const handleSelectAnswer = useCallback((answer) => {
    if (!session || !currentQuestion) return
    submitAnswer(currentQuestion.id, answer)
  }, [session, currentQuestion, submitAnswer])

  const handleNext = useCallback(() => {
    const currentSession = useExamStore.getState().session
    const currentIndex = useExamStore.getState().currentQuestionIndex
    const total = currentSession?.questions?.length || 0

    if (currentIndex < total - 1) {
      setCurrentQuestionIndex(currentIndex + 1)
    } else {
      const completedSession = completeSession()
      if (completedSession) {
        addSession(completedSession)
        navigate('/results', { state: { session: completedSession } })
      }
    }
  }, [setCurrentQuestionIndex, completeSession, addSession, navigate])

  const handlePrevious = useCallback(() => {
    const currentIndex = useExamStore.getState().currentQuestionIndex
    if (currentIndex > 0) setCurrentQuestionIndex(currentIndex - 1)
  }, [setCurrentQuestionIndex])

  const handleQuit = useCallback(() => {
    clearSession()
    navigate('/', { replace: true })
  }, [clearSession, navigate])

  // Keyboard shortcuts: 1-5 maps to choices a-e
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const key = e.key
      const currentSession = useExamStore.getState().session
      const currentIndex = useExamStore.getState().currentQuestionIndex
      const currentQ = currentSession?.questions?.[currentIndex]
      const modalOpen = showQuitModal

      if (modalOpen) return

      // Number keys 1-5 to select answers
      if (KEY_MAP[key] && currentQ) {
        e.preventDefault()
        const choiceKeys = Object.keys(currentQ.choices || {})
        if (choiceKeys.includes(KEY_MAP[key])) {
          submitAnswer(currentQ.id, KEY_MAP[key])
        }
      }

      // Arrow keys for navigation
      if (key === 'ArrowRight' || key === 'ArrowLeft') {
        e.preventDefault()
        if (key === 'ArrowRight') {
          const total = currentSession?.questions?.length || 0
          if (currentIndex < total - 1) {
            setCurrentQuestionIndex(currentIndex + 1)
          } else {
            const completedSession = completeSession()
            if (completedSession) {
              addSession(completedSession)
              navigate('/results', { state: { session: completedSession } })
            }
          }
        } else if (key === 'ArrowLeft' && currentIndex > 0) {
          setCurrentQuestionIndex(currentIndex - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showQuitModal, submitAnswer, setCurrentQuestionIndex, completeSession, addSession, navigate])

  const handleDismissKeyboardHint = () => {
    localStorage.setItem(KEYBOARD_HINT_KEY, 'true')
    setShowKeyboardHint(false)
  }

  const timePerQuestion = 1.5 * 60
  const totalDuration = isSimulator ? 225 * 60 : totalQuestions * timePerQuestion
  const { timeLeft, isRunning, pause, resume } = useTimer({
    durationSeconds: totalDuration,
    onExpire: () => {
      const completedSession = completeSession()
      if (completedSession) {
        addSession(completedSession)
        navigate('/results', { state: { session: completedSession } })
      }
    },
    autoStart: (isTimed || isSimulator) && !isPaused,
  })

  useEffect(() => {
    if (!isTimed && !isSimulator) return

    if (isPaused) pause()
    else resume()
  }, [isPaused, isTimed, isSimulator, pause, resume])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!session || !currentQuestion) return null

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto space-y-4 lg:[&_.card>div.space-y-2]:grid lg:[&_.card>div.space-y-2]:grid-cols-2 lg:[&_.card>div.space-y-2]:gap-3 lg:[&_.card>div.space-y-2]:space-y-0">
        {/* Keyboard Shortcut Hint */}
        {showKeyboardHint && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <Keyboard className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Keyboard Shortcuts Available
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Press <kbd className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-xs font-mono">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-xs font-mono">5</kbd> to select choices, <kbd className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-xs font-mono">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-xs font-mono">→</kbd> to navigate questions.
              </p>
            </div>
            <button
              onClick={handleDismissKeyboardHint}
              className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <h2 className="text-lg font-semibold">
              {isSimulator ? 'CSE Simulator' : 'CSE Exam'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuitModal(true)}
              className="p-2 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
              title="Quit exam"
            >
              <X className="w-5 h-5" />
            </button>
            {(isTimed || isSimulator) && !isSimulator && (
              <>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
              </>
            )}
            {(isTimed || isSimulator) && (
              <>
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

        {currentQuestion?.hasImage && (
          <QuestionImage questionId={currentQuestion.passageId || currentQuestion.id} alt="Question diagram" />
        )}

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
        title={isSimulator ? 'Quit Simulator?' : 'Quit Exam?'}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {isSimulator
              ? 'Are you sure you want to quit the simulator? Your progress will not be saved and this will count as an incomplete attempt.'
              : 'Are you sure you want to quit this exam? Your progress will not be saved.'
            }
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
              {isSimulator ? 'Quit Simulator' : 'Quit Exam'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}