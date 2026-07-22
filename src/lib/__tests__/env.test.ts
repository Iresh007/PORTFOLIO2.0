import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// The job board feature is hard-disabled — it isn't relevant content for
// this portfolio site. isJobBoardEnabled() always returns false, regardless
// of any VITE_HN_JOB_BOARD env var or dev/production mode.

describe('isJobBoardEnabled', () => {
  const originalEnv = { ...import.meta.env }

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv)
  })

  it('returns false when VITE_HN_JOB_BOARD is "true"', async () => {
    import.meta.env.VITE_HN_JOB_BOARD = 'true'
    const { isJobBoardEnabled } = await import('../env')
    expect(isJobBoardEnabled()).toBe(false)
  })

  it('returns false when VITE_HN_JOB_BOARD is "false"', async () => {
    import.meta.env.VITE_HN_JOB_BOARD = 'false'
    const { isJobBoardEnabled } = await import('../env')
    expect(isJobBoardEnabled()).toBe(false)
  })

  it('returns false in dev mode when not set', async () => {
    delete (import.meta.env as Record<string, unknown>).VITE_HN_JOB_BOARD
    import.meta.env.DEV = true
    const { isJobBoardEnabled } = await import('../env')
    expect(isJobBoardEnabled()).toBe(false)
  })

  it('returns false in production mode when not set', async () => {
    delete (import.meta.env as Record<string, unknown>).VITE_HN_JOB_BOARD
    import.meta.env.DEV = false
    const { isJobBoardEnabled } = await import('../env')
    expect(isJobBoardEnabled()).toBe(false)
  })

  it('returns false even when "true" is explicitly set alongside dev mode', async () => {
    import.meta.env.VITE_HN_JOB_BOARD = 'true'
    import.meta.env.DEV = false
    const { isJobBoardEnabled } = await import('../env')
    expect(isJobBoardEnabled()).toBe(false)
  })

  it('returns false when "false" is explicitly set alongside dev mode', async () => {
    import.meta.env.VITE_HN_JOB_BOARD = 'false'
    import.meta.env.DEV = true
    const { isJobBoardEnabled } = await import('../env')
    expect(isJobBoardEnabled()).toBe(false)
  })
})
