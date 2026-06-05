import { shuffleArray } from './shuffle'

const unitStandalone = (q) => ({ itemType: 'standalone', data: q })
const unitGroup = (g) => ({ itemType: 'group', data: g })

const buildPassageQuestion = ({ group, groupIndex, q, questionIndexWithinGroup }) => {
  const groupQuestionsCount = group.questions?.length ?? 0
  return {
    type: 'passage_question',
    id: q.id,
    category: group.category,
    subcategory: group.subcategory,
    // Passage group question items often don't include their own difficulty.
    // Fall back to the parent passage group's difficulty to keep UI labels consistent.
    difficulty: q?.difficulty ?? group?.difficulty,
    source: group.source,

    passageId: group.id,
    passageTitle: group.title,
    passageText: group.passage,

    isFirstInGroup: questionIndexWithinGroup === 0,
    groupSize: groupQuestionsCount,
    groupIndex,

    question: q.question,
    choices: q.choices,
    answer: q.answer,
    explanation: q.explanation,
  }
}

/**
 * Build a shuffled, expanded session pool from standalone questions and passage groups.
 */
export function buildExamPool({
  questions,
  passageGroups,
  categories = [],
  difficulty = 'all',
  count,
  specificIds = [],
}) {
  const normalizedDifficulty = difficulty ?? 'all'

  const matchesCatStandalone = (q) =>
    categories.length === 0 || categories.includes(q.category)

  const matchesCatGroup = (g) =>
    categories.length === 0 || categories.includes(g.category)

  const matchesDiffStandalone = (q) =>
    normalizedDifficulty === 'all' || q.difficulty === normalizedDifficulty

  const matchesDiffGroup = (g) =>
    normalizedDifficulty === 'all' || g.difficulty === normalizedDifficulty

  let standalonePool = []
  let groupPool = []

  if (specificIds?.length) {
    // Retry wrong answers mode
    standalonePool = (questions ?? []).filter((q) => specificIds.includes(q.id))

    ;(passageGroups ?? []).forEach((g) => {
      const matchingQs = (g.questions ?? []).filter((q) => specificIds.includes(q.id))
      if (matchingQs.length > 0) {
        groupPool.push({
          ...g,
          questions: matchingQs,
        })
      }
    })
  } else {
    // Normal mode
    standalonePool = (questions ?? []).filter(
      (q) => matchesCatStandalone(q) && matchesDiffStandalone(q)
    )

    groupPool = (passageGroups ?? []).filter(
      (g) => matchesCatGroup(g) && matchesDiffGroup(g)
    )
  }

  const groupIndexBase = 0 // only used during expansion ordering

  const mixedUnits = [
    ...standalonePool.map(unitStandalone),
    ...groupPool.map(unitGroup),
  ]

  const shuffledUnits = shuffleArray(mixedUnits)

  const expanded = []
  let passageGroupExpansionCounter = groupIndexBase

  for (const unit of shuffledUnits) {
    if (unit.itemType === 'standalone') {
      expanded.push({
        type: 'standalone',
        ...unit.data,
      })
      continue
    }

    const g = unit.data
    const qs = g.questions ?? []

    qs.forEach((q, i) => {
      expanded.push(
        buildPassageQuestion({
          group: g,
          groupIndex: passageGroupExpansionCounter,
          q,
          questionIndexWithinGroup: i,
        })
      )
    })

    passageGroupExpansionCounter += 1
  }

  if (!count || count >= expanded.length) return expanded

  // Never cut mid-group.
  // Walk back if the cut point lands in the middle of a group.
  let cutAt = count
  while (
    cutAt > 0 &&
    expanded[cutAt] &&
    expanded[cutAt].type === 'passage_question' &&
    !expanded[cutAt].isFirstInGroup
  ) {
    cutAt -= 1
  }

  return expanded.slice(0, cutAt)
}

