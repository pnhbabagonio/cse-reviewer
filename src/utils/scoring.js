export function calculateScore(results) {
  const score = results.filter(r => r.isCorrect).length
  const total = results.length
  const percentage = total === 0 ? 0 : (score / total) * 100
  const passed = percentage >= 80
  return { score, total, percentage, passed }
}

export function calculateCategoryBreakdown(results, questions) {
  const breakdown = {}
  results.forEach(result => {
    const question = questions.find(q => q.id === result.questionId)
    if (!question) return
    const cat = question.category
    if (!breakdown[cat]) breakdown[cat] = { correct: 0, total: 0 }
    breakdown[cat].total++
    if (result.isCorrect) breakdown[cat].correct++
  })
  return breakdown
}