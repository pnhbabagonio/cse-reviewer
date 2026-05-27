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
  return Object.values(currentData.allBanks).flatMap(b => b.questions)
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
        categoryMeta: getCategoryMeta()
      }
    }))
  })
}

export default allQuestions
