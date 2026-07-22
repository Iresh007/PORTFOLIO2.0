import { useState, useCallback } from 'react'

interface UsePdfDownloadResult {
  isGenerating: boolean
  error: string | null
  run: (task: () => Promise<void> | void) => Promise<void>
  clearError: () => void
}

export const PDF_GENERATION_ERROR_MESSAGE =
  'Something went wrong generating the PDF. Please try again, or reach out directly if it keeps happening.'

/**
 * Runs a PDF-generation task and reports whether it succeeded.
 *
 * Pulled out of the hook as a plain function so the success/failure
 * handling (the part most likely to have bugs) is testable without
 * needing to render a React component or hook.
 * @internal Exported for testing
 */
export async function runPdfTask(
  task: () => Promise<void> | void
): Promise<{ success: true } | { success: false; message: string }> {
  try {
    await task()
    return { success: true }
  } catch (err) {
    console.error('PDF generation failed:', err)
    return { success: false, message: PDF_GENERATION_ERROR_MESSAGE }
  }
}

/**
 * Shared loading/error state for PDF generation triggers (resume and cover
 * letter downloads). Consolidates what was previously duplicated across
 * ResumeDownloadButtons, ResumeDownloadLinks, and CoverLetterDialog —
 * including making download failures visible instead of silently
 * swallowing them.
 */
export function usePdfDownload(): UsePdfDownloadResult {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (task: () => Promise<void> | void) => {
    setIsGenerating(true)
    setError(null)
    const result = await runPdfTask(task)
    if (!result.success) {
      setError(result.message)
    }
    setIsGenerating(false)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { isGenerating, error, run, clearError }
}
