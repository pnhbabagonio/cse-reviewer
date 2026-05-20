// This hook is mainly a placeholder; core logic is in examStore.
// We'll keep it simple for now.
import useExamStore from '../store/examStore'

export default function useExamSession() {
  const { session, submitAnswer, completeSession, bookmarkQuestion, isBookmarked } = useExamStore()
  return { session, submitAnswer, completeSession, bookmarkQuestion, isBookmarked }
}