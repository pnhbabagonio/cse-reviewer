import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ExamSetup from './pages/ExamSetup'
import ExamSession from './pages/ExamSession'
import Results from './pages/Results'
import AnswerReview from './pages/AnswerReview'
import History from './pages/History'
import Bookmarks from './pages/Bookmarks'
import FlaggedQuestions from './pages/FlaggedQuestions'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { useEffect } from 'react'
import useSettingsStore from './store/settingsStore'
import useExamStore from './store/examStore'
import useAuthStore from './store/authStore'

function App() {
  const { darkMode } = useSettingsStore()
  const { loadAllQuestions, session, clearSession } = useExamStore()
  const initAuth = useAuthStore((state) => state.init)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    loadAllQuestions()
    initAuth()
  }, [loadAllQuestions, initAuth])

  useEffect(() => {
    const handleDataRefresh = () => {
      console.log('Data files changed, reloading questions...')
      if (session) {
        clearSession()
      }
      loadAllQuestions()
    }

    window.addEventListener('data-refresh', handleDataRefresh)
    return () => window.removeEventListener('data-refresh', handleDataRefresh)
  }, [loadAllQuestions, session, clearSession])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={session ? <Navigate to="/exam" replace /> : <Home />} />
          <Route path="setup" element={<ExamSetup />} />
          <Route path="exam" element={<ExamSession />} />
          <Route path="results" element={<Results />} />
          <Route path="review" element={<AnswerReview />} />
          <Route path="history" element={<History />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="flagged" element={<FlaggedQuestions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App