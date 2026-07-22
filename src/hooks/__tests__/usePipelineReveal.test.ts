import { describe, it, expect } from 'vitest'
import { usePipelineReveal } from '../usePipelineReveal'

describe('usePipelineReveal', () => {
  it('exports a function', () => {
    expect(typeof usePipelineReveal).toBe('function')
  })

  it('is named correctly for React DevTools', () => {
    expect(usePipelineReveal.name).toBe('usePipelineReveal')
  })

  it('module resolves without error', async () => {
    const mod = await import('../usePipelineReveal')
    expect(mod.usePipelineReveal).toBeDefined()
  })
})
