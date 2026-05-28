import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getAllQuestions,
  getQuestionsByCategory,
  allPassageGroups,
  passageGroupsByCategory,
} from '../data/index.js'

import { buildExamPool } from '../utils/examBuilder'


const createSessionId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const isValidQuestion = (question) => (
  question &&
  typeof question.id === 'string' &&
  typeof question.category === 'string' &&
  typeof question.difficulty === 'string' &&
  typeof question.question === 'string' &&
  question.choices &&
  typeof question.choices === 'object' &&
  typeof question.answer === 'string'
)

const getImportedQuestions = () => {
  const stored = localStorage.getItem('cse_imported_bank')
  if (!stored) return []

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch(e) {
    return []
  }
}

const getBundledQuestionPool = (selectedCategories = []) => {
  const questionsData = getQuestionsByCategory()
  const allQs = getAllQuestions()
  
  if (selectedCategories.length === 0) return allQs

  return selectedCategories.flatMap(cat => questionsData[cat] ?? [])
}

const getSubcategoryKey = (question) => (
  `${question.category}::${question.subcategory || 'uncategorized'}`
)

// UI filter needs to include passage-group subcategories that don't exist in allQuestions (standalone-only).
// Return a flattened list of "filterable" question-shaped objects:
// - standalone questions: use as-is
// - passage groups: represented as synthetic objects with category/subcategory/difficulty so ExamSetup chips can be generated.
const getFilterableQuestionsForSubcategoryUI = () => {
  const standalone = getMergedQuestionPool()

  const passageAsSynthetic = (allPassageGroups ?? []).map((g) => ({
    // stable-ish id for UI usage; actual session pool uses expanded passage_question IDs
    id: `pg-ui::${g.id}`,
    category: g.category,
    subcategory: g.subcategory || 'uncategorized',
    difficulty: g.difficulty,
  }))

  // Deduplicate by a composite of (category, subcategory, difficulty) so chip totals/counts don't explode.
  // Keep standalone questions too because ExamSetup's availableCount uses filtering at the chip level.
  const seen = new Set()
  const out = []

  for (const q of standalone) {
    const key = `${q.category}::${q.subcategory || 'uncategorized'}::${q.difficulty || 'all'}::standalone`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(q)
  }

  for (const gq of passageAsSynthetic) {
    const key = `${gq.category}::${gq.subcategory || 'uncategorized'}::${gq.difficulty || 'all'}::passage`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(gq)
  }

  return out
}

const getMergedQuestionPool = (selectedCategories = []) => {
  const importedQuestions = getImportedQuestions()
  const importedPool = selectedCategories.length === 0
    ? importedQuestions
    : importedQuestions.filter(q => selectedCategories.includes(q.category))
  const merged = [...getBundledQuestionPool(selectedCategories), ...importedPool]
    .filter(isValidQuestion)

  return Array.from(new Map(merged.map(q => [q.id, q])).values())
}

const useExamStore = create(
  persist(
    (set, get) => ({
      allQuestions: [],      // merged bundled + imported
      bookmarks: [],         // array of question IDs
      session: null,         // active session object
      currentQuestionIndex: 0, // track current question index

      loadQuestions: (selectedCategories = []) => {
        set({ allQuestions: getMergedQuestionPool(selectedCategories) })
      },

      loadAllQuestions: () => {
        get().loadQuestions()
      },

      getQuestions: () => get().allQuestions,

      // Used by ExamSetup to build the subcategory chip list including passage-group derived subcategories.
      getFilterableQuestionsForSubcategoryUI: () => {
        return getFilterableQuestionsForSubcategoryUI()
      },

      getQuestionStats: () => {
        const questions = get().allQuestions
        const categoryCounts = questions.reduce((counts, question) => {
          const category = question.category || 'uncategorized'
          counts[category] = (counts[category] || 0) + 1
          return counts
        }, {})

        return {
          totalQuestions: questions.length,
          categoryCounts,
        }
      },

      startSession: (config) => {
        const {
          mode,
          categories,
          difficulty,
          questionCount,
          retryWrongIds,
          subcategoryKeys,
        } = config

        // Apply existing subcategory filtering to standalone questions.
        // Passage groups do not have subcategoryKeys inside their questions,
        // so we approximate by group.subcategory.
        const selectedCategories = categories || []
        const selectedDiff = difficulty || 'all'

        const standaloneQuestions = retryWrongIds
          ? getMergedQuestionPool().filter((q) => retryWrongIds.includes(q.id))
          : getMergedQuestionPool(selectedCategories).filter((q) => {
              const catOk = selectedCategories.length === 0 || selectedCategories.includes(q.category)
              const diffOk = selectedDiff === 'all' || q.difficulty === selectedDiff
              const subOk =
                !subcategoryKeys ||
                subcategoryKeys.length === 0 ||
                subcategoryKeys.includes(getSubcategoryKey(q))
              return catOk && diffOk && subOk
            })

        const passageGroups = retryWrongIds
          ? (selectedCategories.length === 0 ? allPassageGroups : selectedCategories.flatMap((cat) => passageGroupsByCategory[cat] ?? []))
          : (selectedCategories.length === 0
              ? allPassageGroups
              : selectedCategories.flatMap((cat) => passageGroupsByCategory[cat] ?? []))

        // Difficulty filter for passage groups
        const filteredPassageGroups = (passageGroups ?? []).filter((g) => {
          const diffOk = selectedDiff === 'all' || g.difficulty === selectedDiff
          const subOk =
            !subcategoryKeys ||
            subcategoryKeys.length === 0 ||
            subcategoryKeys.includes(`${g.category}::${g.subcategory || 'uncategorized'}`)

          if (retryWrongIds) {
            // Retry mode: keep only groups that contain at least one question in retryWrongIds
            const hasAny = (g.questions ?? []).some((q) => retryWrongIds.includes(q.id))
            return hasAny && diffOk && subOk
          }

          const catOk = selectedCategories.length === 0 || selectedCategories.includes(g.category)
          return catOk && diffOk && subOk
        })

        const pool = buildExamPool({
          questions: standaloneQuestions,
          passageGroups: filteredPassageGroups,
          categories: selectedCategories,
          difficulty: selectedDiff,
          count: questionCount,
          specificIds: retryWrongIds || [],
        })

        if (pool.length === 0) return null

        const sessionObj = {
          id: createSessionId(),
          mode,
          categories: selectedCategories,
          subcategoryKeys: subcategoryKeys || [],
          difficulty: selectedDiff,
          totalQuestions: pool.length,
          questions: pool,
          answers: {},
          startTime: Date.now(),
          config,
        }
        set({ session: sessionObj, currentQuestionIndex: 0 })
        return sessionObj
      },


      setCurrentQuestionIndex: (index) => {
        set({ currentQuestionIndex: index })
      },

      submitAnswer: (questionId, answer) => {
        const { session } = get()
        if (!session) return
        const newAnswers = { ...session.answers, [questionId]: answer }
        set({ session: { ...session, answers: newAnswers } })
      },

      bookmarkQuestion: (questionId) => {
        const { bookmarks } = get()
        let newBookmarks
        if (bookmarks.includes(questionId)) {
          newBookmarks = bookmarks.filter(id => id !== questionId)
        } else {
          newBookmarks = [...bookmarks, questionId]
        }
        set({ bookmarks: newBookmarks })
        localStorage.setItem('cse_bookmarks', JSON.stringify(newBookmarks))
      },

      isBookmarked: (questionId) => {
        return get().bookmarks.includes(questionId)
      },

      clearBookmarks: () => {
        set({ bookmarks: [] })
        localStorage.removeItem('cse_bookmarks')
      },

      completeSession: () => {
        const { session } = get()
        if (!session) return null
        const results = session.questions.map(q => {
          const userAnswer = session.answers[q.id]
          const isCorrect = userAnswer === q.answer
          return {
            questionId: q.id,
            userAnswer: userAnswer || null,
            correctAnswer: q.answer,
            isCorrect: isCorrect || false,
          }
        })
        const score = results.filter(r => r.isCorrect).length
        const percentage = session.totalQuestions === 0 ? 0 : (score / session.totalQuestions) * 100
        const passed = percentage >= 80
        const timeTakenSeconds = Math.floor((Date.now() - session.startTime) / 1000)

        // Category breakdown
        const categoryBreakdown = {}
        results.forEach((r, idx) => {
          const q = session.questions[idx]
          const cat = q.category
          if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { correct: 0, total: 0 }
          categoryBreakdown[cat].total++
          if (r.isCorrect) categoryBreakdown[cat].correct++
        })

        const completed = {
          id: session.id,
          date: new Date().toISOString(),
          mode: session.mode,
          categories: session.categories,
          difficulty: session.difficulty,
          totalQuestions: session.totalQuestions,
          score,
          percentage,
          passed,
          timeTakenSeconds,
          results,
          categoryBreakdown,
        }
        set({ session: null, currentQuestionIndex: 0 })
        return completed
      },

      clearSession: () => set({ session: null, currentQuestionIndex: 0 }),
    }),
    {
      name: 'cse_exam_store',
      partialize: (state) => ({ 
        bookmarks: state.bookmarks,
        session: state.session,
        currentQuestionIndex: state.currentQuestionIndex,
      }),
    }
  )
)

// Listen for data changes and reload questions automatically
if (typeof window !== 'undefined') {
  window.addEventListener('data-refresh', () => {
    // Reload all questions without categories to refresh the data
    useExamStore.getState().loadQuestions()
    
    // If there's an active session, close it and return to dashboard
    const currentSession = useExamStore.getState().session
    if (currentSession) {
      useExamStore.getState().clearSession()
    }
  })
}

export default useExamStore
