//FlaggedQuestions.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flag, X, Eye } from 'lucide-react'
import useFlagStore, { FLAG_REASONS } from '../store/flagStore'
import useExamStore from '../store/examStore'
import CategoryBadge from '../components/CategoryBadge'
import SubcategoryBadge from '../components/SubcategoryBadge'

export default function FlaggedQuestions() {
    const navigate = useNavigate()
    const { flags, unflagQuestion, getFlaggedIds } = useFlagStore()
    const { allQuestions } = useExamStore()
    const [filterReason, setFilterReason] = useState('all')

    const flaggedIds = getFlaggedIds()
    const flaggedQuestions = flaggedIds
        .map((id) => {
            const question = allQuestions.find((q) => q.id === id)
            const flag = flags[id]
            if (!question) return null
            return { ...question, flagReason: flag?.reason, flagTimestamp: flag?.timestamp }
        })
        .filter(Boolean)
        .filter((q) => filterReason === 'all' || q.flagReason === filterReason)
        .sort((a, b) => b.flagTimestamp - a.flagTimestamp)

    const reasonCounts = FLAG_REASONS.reduce((counts, r) => {
        counts[r.value] = flaggedIds.filter((id) => flags[id]?.reason === r.value).length
        return counts
    }, {})

    const totalFlagged = flaggedIds.length

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-navy dark:text-white">Flagged Questions</h1>
                <span className="text-sm text-gray-500">{totalFlagged} flagged</span>
            </div>

            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFilterReason('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${filterReason === 'all'
                            ? 'bg-navy text-white'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                >
                    All ({totalFlagged})
                </button>
                {FLAG_REASONS.map((r) => (
                    <button
                        key={r.value}
                        onClick={() => setFilterReason(r.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${filterReason === r.value
                                ? 'bg-navy text-white'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            } ${reasonCounts[r.value] === 0 ? 'opacity-50' : ''}`}
                    >
                        {r.icon} {r.label} ({reasonCounts[r.value] || 0})
                    </button>
                ))}
            </div>

            {flaggedQuestions.length === 0 ? (
                <div className="max-w-2xl mx-auto py-12 text-center">
                    <Flag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">No Flagged Questions</h2>
                    <p className="text-gray-500">Flag questions during exams or review to track issues.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {flaggedQuestions.map((question) => {
                        const reason = FLAG_REASONS.find((r) => r.value === question.flagReason)
                        return (
                            <div key={question.id} className="card">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <CategoryBadge category={question.category} />
                                            <SubcategoryBadge subcategory={question.subcategory} />
                                            {reason && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                                    {reason.icon} {reason.label}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                            {question.question}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(question.flagTimestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                            onClick={() => navigate('/setup', {
                                                state: {
                                                    mode: 'practice',
                                                    categories: [question.category],
                                                    wrongQuestionIds: [question.id],
                                                }
                                            })}
                                            className="p-2 text-gray-400 hover:text-navy dark:hover:text-gold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                            title="Practice this question"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => unflagQuestion(question.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                            title="Remove flag"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
} 