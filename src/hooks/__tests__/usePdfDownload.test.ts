import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runPdfTask, PDF_GENERATION_ERROR_MESSAGE } from '../usePdfDownload'

describe('runPdfTask', () => {
  // Regression coverage for a bug found in code review: the original
  // download handlers used try/finally with no catch, so a thrown error
  // (e.g. jsPDF failing, a malformed data field) was silently swallowed —
  // isGenerating reset to false but the user got no indication anything
  // went wrong. These tests assert success/failure is always reported.

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('reports success when the task completes without throwing', async () => {
    const result = await runPdfTask(() => {})
    expect(result).toEqual({ success: true })
  })

  it('reports success for an async task that resolves', async () => {
    const result = await runPdfTask(async () => {
      await Promise.resolve()
    })
    expect(result).toEqual({ success: true })
  })

  it('reports failure with a user-facing message when the task throws synchronously', async () => {
    const result = await runPdfTask(() => {
      throw new Error('jsPDF blew up')
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.message).toBe(PDF_GENERATION_ERROR_MESSAGE)
    }
  })

  it('reports failure when an async task rejects', async () => {
    const result = await runPdfTask(async () => {
      throw new Error('dynamic import failed')
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.message).toBe(PDF_GENERATION_ERROR_MESSAGE)
    }
  })

  it('logs the underlying error to the console for debugging, without leaking it to the user message', async () => {
    const originalError = new Error('very specific internal failure detail')
    const result = await runPdfTask(() => {
      throw originalError
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'PDF generation failed:',
      originalError
    )
    if (!result.success) {
      // The user-facing message should be generic/helpful, not a raw
      // stack trace or internal error string.
      expect(result.message).not.toContain('very specific internal failure')
    }
  })

  it('does not throw out of runPdfTask itself, even for a throwing task', async () => {
    await expect(
      runPdfTask(() => {
        throw new Error('boom')
      })
    ).resolves.toBeDefined()
  })
})
