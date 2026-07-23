import { useState } from 'react'

export default function QuestionImage({ questionId, alt = 'Question diagram' }) {
  const [error, setError] = useState(false)

  if (error) return null

  return (
    <div className="mb-4 flex justify-center">
      <img
        src={`/images/questions/${questionId}.png`}
        alt={alt}
        className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
        onError={() => setError(true)}
      />
    </div>
  )
}