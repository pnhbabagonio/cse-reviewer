import verbal from './verbal.json'
import analytical from './analytical.json'
import numerical from './numerical.json'
import general_info from './general_info.json'
import filipino from './filipino.json'

const countBySubcategory = (questions) => questions.reduce((counts, question) => {
  const subcategory = question.subcategory || 'uncategorized'
  counts[subcategory] = (counts[subcategory] || 0) + 1
  return counts
}, {})

// Store current data in a mutable reference
let currentData = {
  allBanks: { verbal, analytical, numerical, general_info, filipino },
}

const updateAllBanks = () => {
  currentData.allBanks = { verbal, analytical, numerical, general_info, filipino }
}

/**
 * Flat array of every question across all categories.
 * Use this when no category filter is applied.
 */
export const getAllQuestions = () => {
  const standalone = Object.values(currentData.allBanks).flatMap(b => b.questions)
  
  // Flatten passage group questions with passage metadata attached
  const passageGroups = Object.values(currentData.allBanks).flatMap(b => b.passageGroups ?? [])
  const passageQuestions = passageGroups.flatMap((group, groupIndex) => {
    const qs = group.questions ?? []
    return qs.map((q, questionIndexWithinGroup) => ({
      type: 'passage_question',
      id: q.id,
      category: group.category,
      subcategory: group.subcategory || 'uncategorized',
      difficulty: q.difficulty || group.difficulty || 'average',
      source: group.source,

      passageId: group.id,
      passageTitle: group.title,
      passageText: group.passage,

      isFirstInGroup: questionIndexWithinGroup === 0,
      groupSize: qs.length,
      groupIndex,

      question: q.question,
      choices: q.choices,
      answer: q.answer,
      explanation: q.explanation,
    }))
  })
  
  return [...standalone, ...passageQuestions]
}

export const allQuestions = getAllQuestions()

/**
 * Questions keyed by category string.
 * Use this when the exam session has a category filter.
 * Example: questionsByCategory['verbal'] → array of verbal questions
 */
export const getQuestionsByCategory = () => {
  return Object.fromEntries(
    Object.entries(currentData.allBanks).map(([key, bank]) => [key, bank.questions])
  )
}

export const questionsByCategory = getQuestionsByCategory()

/**
 * Passage groups (passage + related questions) keyed by category.
 */
export const getAllPassageGroups = () => {
  return Object.values(currentData.allBanks).flatMap(b => b.passageGroups ?? [])
}

export const allPassageGroups = getAllPassageGroups()

export const getPassageGroupsByCategory = () => {
  return Object.fromEntries(
    Object.entries(currentData.allBanks).map(([key, bank]) => [key, bank.passageGroups ?? []])
  )
}

export const passageGroupsByCategory = getPassageGroupsByCategory()

/**
 * Meta info per category.
 * Use this in the Settings screen to show question bank stats.
 * Example: categoryMeta['numerical'].total → number of numerical questions
 */
export const getCategoryMeta = () => {
  return Object.fromEntries(
    Object.entries(currentData.allBanks).map(([key, bank]) => [
      key,
      {
        ...bank.meta,
        total: bank.questions.length,
        subcategories: countBySubcategory(bank.questions),
      },
    ])
  )
}

export const categoryMeta = getCategoryMeta()

// Enable HMR for data files to prevent full app reset on data changes
if (import.meta.hot) {
  import.meta.hot.accept(['./verbal.json', './analytical.json', './numerical.json', './general_info.json', './filipino.json'], (modules) => {
    // Re-update the data from imports
    updateAllBanks()
    
    // Trigger a custom event to reload questions in the store
    window.dispatchEvent(new CustomEvent('data-refresh', { 
      detail: { 
        timestamp: Date.now(),
        allQuestions: getAllQuestions(),
        questionsByCategory: getQuestionsByCategory(),
        categoryMeta: getCategoryMeta(),
        allPassageGroups: getAllPassageGroups(),
        passageGroupsByCategory: getPassageGroupsByCategory(),
      }
    }))
  })
}

export default allQuestions

