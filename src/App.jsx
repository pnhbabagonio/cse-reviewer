import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ExamSetup from './pages/ExamSetup'
import ExamSession from './pages/ExamSession'
import Results from './pages/Results'
import AnswerReview from './pages/AnswerReview'
import History from './pages/History'
import Bookmarks from './pages/Bookmarks'
import Settings from './pages/Settings'
import { useEffect } from 'react'
import useSettingsStore from './store/settingsStore'
import useExamStore from './store/examStore'

function App() {
  const { darkMode } = useSettingsStore()
  const { loadAllQuestions } = useExamStore()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    loadAllQuestions()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="setup" element={<ExamSetup />} />
          <Route path="exam" element={<ExamSession />} />
          <Route path="results" element={<Results />} />
          <Route path="review" element={<AnswerReview />} />
          <Route path="history" element={<History />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
