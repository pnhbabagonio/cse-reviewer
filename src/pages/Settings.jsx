import { useState } from 'react'
import useSettingsStore from '../store/settingsStore'
import useExamStore from '../store/examStore'
import useProgressStore from '../store/progressStore'
import { useStudyTimeStore } from '../store/studyTimeStore'
import { allQuestions, categoryMeta } from '../data/index.js'
import Modal from '../components/Modal'

const DEFAULT_EXAM_NAME = 'Civil Service Examination'
const GOAL_PRESETS = [30, 60, 90, 120]

const formatDuration = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600)
  const min = Math.floor((totalSeconds % 3600) / 60)
  if (hrs === 0) return `${min} min`
  if (min === 0) return `${hrs} hr`
  return `${hrs} hr ${min} min`
}

const getInitialGoalSelection = (minutes) => {
  if (!minutes) return null
  return GOAL_PRESETS.includes(minutes) ? minutes : 'custom'
}

export default function Settings() {
  const {
    darkMode,
    timerSound,
    examCountdown,
    toggleDarkMode,
    toggleTimerSound,
    importQuestions,
    setExamCountdown,
    clearExamCountdown,
  } = useSettingsStore()
  const { clearBookmarks } = useExamStore()
  const { clearHistory } = useProgressStore()
  const { dailyGoalMinutes, setDailyGoal, clearRecords } = useStudyTimeStore()
  const [showResetModal, setShowResetModal] = useState(false)
  const [showResetStudyConfirm, setShowResetStudyConfirm] = useState(false)
  const [importStatus, setImportStatus] = useState(null)
  const [saveStatus, setSaveStatus] = useState(null)
  const [studyStatus, setStudyStatus] = useState(null)
  const [examName, setExamName] = useState(examCountdown?.examName ?? DEFAULT_EXAM_NAME)
  const [examDate, setExamDate] = useState(examCountdown?.examDate ?? '')
  const [selectedGoal, setSelectedGoal] = useState(getInitialGoalSelection(dailyGoalMinutes))
  const [customMinutes, setCustomMinutes] = useState(
    dailyGoalMinutes && !GOAL_PRESETS.includes(dailyGoalMinutes) ? String(dailyGoalMinutes) : ''
  )

  const totalQuestions = allQuestions.length

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.questions && Array.isArray(data.questions)) {
          importQuestions(data.questions)
          setImportStatus({ success: true, message: `Imported ${data.questions.length} questions` })
        } else {
          throw new Error('Invalid format')
        }
      } catch (err) {
        setImportStatus({ success: false, message: 'Invalid JSON file' })
      }
      setTimeout(() => setImportStatus(null), 3000)
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleReset = () => {
    clearHistory()
    clearBookmarks()
    window.location.reload()
  }

  const handleSave = () => {
    if (!examName.trim() || !examDate) return
    setExamCountdown(examName.trim(), examDate)
    setSaveStatus('Countdown saved')
    setTimeout(() => setSaveStatus(null), 2500)
  }

  const handleRemove = () => {
    clearExamCountdown()
    setExamName(DEFAULT_EXAM_NAME)
    setExamDate('')
    setSaveStatus(null)
  }

  const handleSaveGoal = () => {
    const mins = selectedGoal === 'custom' ? parseInt(customMinutes, 10) : selectedGoal
    if (!mins || mins < 1 || mins > 480) return
    setDailyGoal(mins)
    setStudyStatus('Study goal saved')
    setTimeout(() => setStudyStatus(null), 2500)
  }

  const handleResetStudyTime = () => {
    clearRecords()
    setShowResetStudyConfirm(false)
    setStudyStatus('Study time reset')
    setTimeout(() => setStudyStatus(null), 2500)
  }

  const customGoalMinutes = parseInt(customMinutes, 10)
  const customGoalInvalid = selectedGoal === 'custom' && (
    !Number.isFinite(customGoalMinutes) ||
    customGoalMinutes < 1 ||
    customGoalMinutes > 480
  )

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold text-navy dark:text-white">Settings</h1>

      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
        <div className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-semibold text-lg">Appearance</h2>
            <div className="flex justify-between items-center">
              <span>Dark Mode</span>
              <button
                onClick={toggleDarkMode}
                className="w-12 h-6 rounded-full bg-gray-300 dark:bg-navy relative transition-colors"
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-lg">Exam Settings</h2>
            <div className="flex justify-between items-center">
              <span>Timer Sound Alerts</span>
              <button
                onClick={toggleTimerSound}
                className="w-12 h-6 rounded-full bg-gray-300 dark:bg-navy relative transition-colors"
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${timerSound ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <section className="card">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
              Exam Countdown
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exam Name
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g., Civil Service Examination"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!examName.trim() || !examDate}
              className="w-full py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed mb-2"
            >
              Save Countdown
            </button>

            {examCountdown && (
              <button
                onClick={handleRemove}
                className="w-full py-2.5 border border-red-400 text-red-500 rounded-lg text-sm font-medium"
              >
                Remove Countdown
              </button>
            )}

            {saveStatus && (
              <p className="text-sm mt-3 text-green-600">{saveStatus}</p>
            )}
          </section>

          <section className="card">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
              Study Time
            </h2>

            {dailyGoalMinutes && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Current goal: <span className="font-medium text-gray-700 dark:text-gray-200">
                  {formatDuration(dailyGoalMinutes * 60)} per day
                </span>
              </p>
            )}

            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Daily Study Goal
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {GOAL_PRESETS.map(mins => (
                <button
                  key={mins}
                  onClick={() => setSelectedGoal(mins)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    selectedGoal === mins
                      ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {mins < 60 ? `${mins} min` : `${mins / 60} hr`}
                </button>
              ))}
              <button
                onClick={() => setSelectedGoal('custom')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  selectedGoal === 'custom'
                    ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                }`}
              >
                Custom
              </button>
            </div>

            {selectedGoal === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minutes per day
                </label>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={customMinutes}
                  onChange={e => setCustomMinutes(e.target.value)}
                  placeholder="e.g., 45"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                />
              </div>
            )}

            <button
              onClick={handleSaveGoal}
              disabled={!selectedGoal || customGoalInvalid}
              className="w-full py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed mb-3"
            >
              Save Goal
            </button>

            <button
              onClick={() => setShowResetStudyConfirm(true)}
              className="w-full py-2.5 border border-red-400 text-red-500 rounded-lg text-sm font-medium"
            >
              Reset Study Time
            </button>

            {studyStatus && (
              <p className="text-sm mt-3 text-green-600">{studyStatus}</p>
            )}
          </section>
        </div>

        <div className="space-y-6 mt-6 lg:mt-0">
          <div className="card space-y-3">
            <h2 className="font-semibold text-lg">Question Bank</h2>
            <div className="text-sm">
              <p>Total questions: {totalQuestions}</p>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {Object.entries(categoryMeta).map(([cat, meta]) => (
                  <div key={cat} className="flex justify-between"><span className="capitalize">{cat}:</span><span>{meta.total}</span></div>
                ))}
              </div>
            </div>
            <div>
              <label className="btn-outline inline-block cursor-pointer text-sm px-4 py-2">Import JSON
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              {importStatus && (
                <p className={`text-sm mt-2 ${importStatus.success ? 'text-green-600' : 'text-red-600'}`}>{importStatus.message}</p>
              )}
            </div>
          </div>

          <div className="card space-y-3">
            <h2 className="font-semibold text-lg">Data Management</h2>
            <button onClick={() => setShowResetModal(true)} className="text-red-600 text-sm">Reset All Progress</button>
          </div>
        </div>
      </div>

      <div className="card text-center text-sm text-gray-500">
        <p>CSE Pro Reviewer v2.0</p>
        <p>Made By Philip The Great</p>
      </div>

      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Progress">
        <p>This will permanently delete all your exam sessions and bookmarks. Your study time records will not be affected. This cannot be undone.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setShowResetModal(false)} className="flex-1 btn-outline">Cancel</button>
          <button onClick={handleReset} className="flex-1 bg-red-600 text-white py-2 rounded-lg">Reset</button>
        </div>
      </Modal>

      <Modal isOpen={showResetStudyConfirm} onClose={() => setShowResetStudyConfirm(false)} title="Reset Study Time?">
        <p>This will permanently delete all your study time records. Your daily goal will be kept. This cannot be undone.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setShowResetStudyConfirm(false)} className="flex-1 btn-outline">Cancel</button>
          <button onClick={handleResetStudyTime} className="flex-1 bg-red-600 text-white py-2 rounded-lg">Reset</button>
        </div>
      </Modal>
    </div>
  )
}
