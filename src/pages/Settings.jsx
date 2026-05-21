import { useState } from 'react'
import useSettingsStore from '../store/settingsStore'
import useExamStore from '../store/examStore'
import useProgressStore from '../store/progressStore'
import { allQuestions, categoryMeta } from '../data/index.js'
import Modal from '../components/Modal'

const DEFAULT_EXAM_NAME = 'Civil Service Examination'

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
  const [showResetModal, setShowResetModal] = useState(false)
  const [importStatus, setImportStatus] = useState(null)
  const [saveStatus, setSaveStatus] = useState(null)
  const [examName, setExamName] = useState(examCountdown?.examName ?? DEFAULT_EXAM_NAME)
  const [examDate, setExamDate] = useState(examCountdown?.examDate ?? '')

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
        <p>CSE Pro Reviewer v1.0</p>
        <p>Made By Philip the Great</p>
      </div>

      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Progress">
        <p>This will delete all your exam history and bookmarks. This action cannot be undone.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setShowResetModal(false)} className="flex-1 btn-outline">Cancel</button>
          <button onClick={handleReset} className="flex-1 bg-red-600 text-white py-2 rounded-lg">Reset</button>
        </div>
      </Modal>
    </div>
  )
}
