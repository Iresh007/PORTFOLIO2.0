import { describe, it, expect, beforeAll } from 'vitest'
import vercelConfig from '../../../vercel.json'
import { designSystemsConfig } from '../loader'

// ============================================================================
// SECURITY & STRUCTURAL REGRESSION TESTS
// Pins security-critical properties — CSP headers, disabled-service
// exclusions, design system integrity — so they can't regress silently.
// Pure-logic only (no fs/path) to stay compatible with tsconfig.app.json.
// ============================================================================

describe('vercel.json security headers', () => {
  type Header = { key: string; value: string }
  let headers: Header[]

  beforeAll(() => {
    headers = (vercelConfig as typeof vercelConfig).headers[0]?.headers ?? []
  })

  const get = (key: string) => headers.find((h) => h.key === key)?.value

  it('Content-Security-Policy header is present', () => {
    expect(get('Content-Security-Policy')).toBeTruthy()
  })

  it('CSP does NOT contain disabled job board origins (SEC-003 regression)', () => {
    const csp = get('Content-Security-Policy') ?? ''
    const disabledDomains = [
      'hn.algolia.com', 'remoteok.com', 'jobicy.com',
      'www.arbeitnow.com', 'remotive.com',
    ]
    for (const domain of disabledDomains) {
      expect(csp, `CSP must not allow disabled domain: ${domain}`).not.toContain(domain)
    }
  })

  it('CSP blocks framing via frame-ancestors none', () => {
    expect(get('Content-Security-Policy')).toContain("frame-ancestors 'none'")
  })

  it('CSP blocks plugin injection via object-src none', () => {
    expect(get('Content-Security-Policy')).toContain("object-src 'none'")
  })

  it('CSP enforces HTTPS upgrades', () => {
    expect(get('Content-Security-Policy')).toContain('upgrade-insecure-requests')
  })

  it('X-Content-Type-Options is nosniff', () => {
    expect(get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('X-Frame-Options is DENY', () => {
    expect(get('X-Frame-Options')).toBe('DENY')
  })

  it('HSTS max-age is at least 2 years (63072000s)', () => {
    const hsts = get('Strict-Transport-Security') ?? ''
    const match = hsts.match(/max-age=(\d+)/)
    expect(match, 'HSTS must contain max-age').not.toBeNull()
    expect(parseInt(match![1], 10)).toBeGreaterThanOrEqual(63072000)
  })

  it('HSTS includes preload directive', () => {
    expect(get('Strict-Transport-Security')).toContain('preload')
  })

  it('Referrer-Policy header is present', () => {
    expect(get('Referrer-Policy')).toBeTruthy()
  })

  it('Cross-Origin-Opener-Policy header is present', () => {
    expect(get('Cross-Origin-Opener-Policy')).toBeTruthy()
  })

  it('Cross-Origin-Resource-Policy header is present', () => {
    expect(get('Cross-Origin-Resource-Policy')).toBeTruthy()
  })

  it('Permissions-Policy disables camera and microphone', () => {
    const pp = get('Permissions-Policy') ?? ''
    expect(pp).toContain('camera=()')
    expect(pp).toContain('microphone=()')
  })

  it('has exactly one catch-all rule covering all routes', () => {
    expect((vercelConfig as typeof vercelConfig).headers).toHaveLength(1)
    expect((vercelConfig as typeof vercelConfig).headers[0].source).toBe('/(.*)')
  })
})

// ── Pipeline design system in live config ───────────────────────────────────

describe('pipeline design system in live config', () => {
  it('pipeline is present', () => {
    expect(designSystemsConfig.systems.map((s) => s.id)).toContain('pipeline')
  })

  it('pipeline is the default system', () => {
    expect(designSystemsConfig.defaultSystem).toBe('pipeline')
  })

  it('total design system count is 7', () => {
    expect(designSystemsConfig.systems).toHaveLength(7)
  })

  it('pipeline declares supportsDarkMode true', () => {
    const p = designSystemsConfig.systems.find((s) => s.id === 'pipeline')
    expect(p?.supportsDarkMode).toBe(true)
  })

  it('pipeline uses IBM Plex Mono as display font', () => {
    const p = designSystemsConfig.systems.find((s) => s.id === 'pipeline')
    expect(p?.fonts?.display?.family).toBe('IBM Plex Mono')
  })

  it('pipeline dark mode has correct accent color', () => {
    const p = designSystemsConfig.systems.find((s) => s.id === 'pipeline')
    expect(p?.tokens?.dark?.colors?.accent).toBe('#3ddc97')
  })

  it('pipeline dark mode has near-black terminal background', () => {
    const p = designSystemsConfig.systems.find((s) => s.id === 'pipeline')
    expect(p?.tokens?.dark?.colors?.background).toBe('#0a0e14')
  })
})

// ── Hook availability ────────────────────────────────────────────────────────

describe('usePipelineReveal hook', () => {
  it('resolves as a module with the expected named export', async () => {
    const mod = await import('../../hooks/usePipelineReveal')
    expect(typeof mod.usePipelineReveal).toBe('function')
    expect(mod.usePipelineReveal.name).toBe('usePipelineReveal')
  })
})
