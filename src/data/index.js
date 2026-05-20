import verbal from './verbal.json'
import analytical from './analytical.json'
import numerical from './numerical.json'
import general_info from './general_info.json'
import filipino from './filipino.json'

const allBanks = { verbal, analytical, numerical, general_info, filipino }

const countBySubcategory = (questions) => questions.reduce((counts, question) => {
  const subcategory = question.subcategory || 'uncategorized'
  counts[subcategory] = (counts[subcategory] || 0) + 1
  return counts
}, {})

/**
 * Flat array of every question across all categories.
 * Use this when no category filter is applied.
 */
export const allQuestions = Object.values(allBanks).flatMap(b => b.questions)

/**
 * Questions keyed by category string.
 * Use this when the exam session has a category filter.
 * Example: questionsByCategory['verbal'] → array of verbal questions
 */
export const questionsByCategory = Object.fromEntries(
  Object.entries(allBanks).map(([key, bank]) => [key, bank.questions])
)

/**
 * Meta info per category.
 * Use this in the Settings screen to show question bank stats.
 * Example: categoryMeta['numerical'].total → number of numerical questions
 */
export const categoryMeta = Object.fromEntries(
  Object.entries(allBanks).map(([key, bank]) => [
    key,
    {
      ...bank.meta,
      total: bank.questions.length,
      subcategories: countBySubcategory(bank.questions),
    },
  ])
)

export default allQuestions
