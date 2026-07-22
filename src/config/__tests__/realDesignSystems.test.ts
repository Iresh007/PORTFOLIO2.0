import { describe, it, expect } from 'vitest'
import { designSystemsConfig } from '../loader'

// Tests against the actual, already-validated config the running app uses
// (designSystemsConfig is loaded and Zod-validated once at module init in
// loader.ts) — this is more meaningful than re-reading and re-parsing the
// raw JSON file, since it's exactly what the app relies on at runtime.

function getPipelineSystem() {
  const pipeline = designSystemsConfig.systems.find(
    (s) => s.id === 'pipeline'
  )
  if (!pipeline) {
    throw new Error('pipeline design system not found in config')
  }
  return pipeline
}

function getPipelineTokens(mode: 'light' | 'dark') {
  const pipeline = getPipelineSystem()
  const tokens = pipeline.tokens?.[mode]
  if (!tokens) {
    throw new Error(`pipeline ${mode} tokens not found`)
  }
  return tokens
}

interface PipelineColors {
  background: string
  foreground: string
  card: string
  'card-foreground': string
  border: string
  primary: string
  'primary-foreground': string
  accent: string
  'accent-foreground': string
  'muted-foreground': string
  palette?: Record<string, string>
}

function getPipelineColors(mode: 'light' | 'dark'): PipelineColors {
  const colors = getPipelineTokens(mode).colors
  if (!colors) throw new Error(`pipeline ${mode} colors not found`)
  // Our pipeline system fully specifies all semantic tokens — assert them here
  // so tests can access any key as a plain string without fighting the
  // Zod PartialDesignTokensSchema union that makes fields optional.
  const r = colors as Record<string, string | undefined>
  const required = [
    'background', 'foreground', 'card', 'card-foreground', 'border',
    'primary', 'primary-foreground', 'accent', 'accent-foreground',
    'muted-foreground',
  ]
  for (const key of required) {
    if (!r[key]) throw new Error(`pipeline ${mode} missing color: ${key}`)
  }
  return r as unknown as PipelineColors
}

describe('the real design-systems.json config', () => {
  it('includes the pipeline design system added in the redesign', () => {
    const ids = designSystemsConfig.systems.map((s) => s.id)
    expect(ids).toContain('pipeline')
  })

  it('sets pipeline as the default system', () => {
    expect(designSystemsConfig.defaultSystem).toBe('pipeline')
  })

  it('pipeline has complete light and dark token sets', () => {
    const pipeline = getPipelineSystem()
    expect(pipeline.supportsDarkMode).toBe(true)
    expect(() => getPipelineTokens('light')).not.toThrow()
    expect(() => getPipelineTokens('dark')).not.toThrow()
  })

  it('pipeline defines its custom accent palette colors in both modes', () => {
    const lightPalette = getPipelineColors('light').palette
    const darkPalette = getPipelineColors('dark').palette
    for (const key of [
      'pipeline-blue',
      'pipeline-gold',
      'pipeline-elev',
      'pipeline-rule',
    ]) {
      expect(lightPalette).toHaveProperty(key)
      expect(darkPalette).toHaveProperty(key)
    }
  })

  it('every system other than pipeline is unaffected (still present)', () => {
    const ids = designSystemsConfig.systems.map((s) => s.id)
    expect(ids).toEqual(
      expect.arrayContaining([
        'corporate',
        'hand-drawn',
        'automotive',
        'bauhaus',
        'editorial',
        'concrete',
      ])
    )
  })

  it('has exactly 7 design systems total', () => {
    expect(designSystemsConfig.systems).toHaveLength(7)
  })

  it('every system id is unique', () => {
    const ids = designSystemsConfig.systems.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every color value in pipeline tokens is a valid hex color', () => {
    const hexPattern = /^#[0-9a-fA-F]{6}$/
    for (const mode of ['light', 'dark'] as const) {
      const colors = getPipelineColors(mode)
      for (const [key, value] of Object.entries(colors)) {
        if (key === 'palette') {
          for (const paletteValue of Object.values(
            value as Record<string, string>
          )) {
            expect(paletteValue).toMatch(hexPattern)
          }
        } else if (typeof value === 'string') {
          expect(value).toMatch(hexPattern)
        }
      }
    }
  })
})

// ============================================================================
// WCAG AA CONTRAST CHECKS — pipeline design system
// ============================================================================
//
// Regression coverage for an issue found during self-review: the light-mode
// accent/primary green (#0f9d6b) only reached 3.47:1 against white, which
// passes for large text/UI components but fails the 4.5:1 AA threshold
// required for normal body text — and text-accent is used as ordinary body
// text in several components. Darkened to #0a7a52 (5.36:1). These tests
// pin the fix so it can't silently regress.

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1))
  const l2 = relativeLuminance(hexToRgb(hex2))
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

const WCAG_AA_NORMAL_TEXT = 4.5

describe('pipeline design system WCAG AA contrast', () => {
  it.each(['light', 'dark'] as const)(
    '%s mode: background vs foreground passes AA for normal text',
    (mode) => {
      const c = getPipelineColors(mode)
      expect(contrastRatio(c.background, c.foreground)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
    }
  )

  it.each(['light', 'dark'] as const)(
    '%s mode: card vs card-foreground passes AA for normal text',
    (mode) => {
      const c = getPipelineColors(mode)
      const cardFg = c['card-foreground'] as string
      expect(contrastRatio(c.card, cardFg)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
    }
  )

  it.each(['light', 'dark'] as const)(
    '%s mode: card vs primary/accent (used as body text via text-accent) passes AA',
    (mode) => {
      const c = getPipelineColors(mode)
      expect(contrastRatio(c.card, c.primary)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
    }
  )

  it.each(['light', 'dark'] as const)(
    '%s mode: accent vs accent-foreground (button text) passes AA',
    (mode) => {
      const c = getPipelineColors(mode)
      const accentFg = c['accent-foreground'] as string
      expect(contrastRatio(c.accent, accentFg)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
    }
  )

  it.each(['light', 'dark'] as const)(
    '%s mode: background vs muted-foreground passes AA',
    (mode) => {
      const c = getPipelineColors(mode)
      const mutedFg = c['muted-foreground'] as string
      expect(contrastRatio(c.background, mutedFg)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT)
    }
  )
})
