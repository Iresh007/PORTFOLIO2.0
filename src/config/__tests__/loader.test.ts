import { describe, it, expect } from 'vitest'
import {
  processTemplateString,
  processTemplates,
  resolveMetricValue,
  resolveMetrics,
  normalizeSkillCategories,
  getCurrentYear,
  getCurrentDecimalYear,
  roundYearsLabel,
  validateNavProjectsConsistency,
  experienceDescription,
  yearsOfExperienceLabel,
} from '../loader'

// ============================================================================
// TEMPLATE STRING PROCESSING TESTS
// ============================================================================

describe('processTemplateString', () => {
  const currentYear = getCurrentYear()

  it('replaces yearsSince template with calculated years', () => {
    const result = processTemplateString('{{yearsSince:careerStart}}+ years', {
      careerStart: 2000,
    })
    expect(result).toBe(`${currentYear - 2000}+ years`)
  })

  it('handles multiple templates in one string', () => {
    const result = processTemplateString(
      '{{yearsSince:start}} years, {{yearsSince:other}} months',
      { start: 2010, other: 2020 }
    )
    expect(result).toBe(
      `${currentYear - 2010} years, ${currentYear - 2020} months`
    )
  })

  it('returns string unchanged when no templates present', () => {
    const result = processTemplateString('No templates here', { foo: 2000 })
    expect(result).toBe('No templates here')
  })

  it('throws error for unknown variable', () => {
    expect(() =>
      processTemplateString('{{yearsSince:unknownVar}}', { known: 2000 })
    ).toThrow('Unknown template variable "unknownVar"')
  })

  it('throws error with available variables listed', () => {
    expect(() =>
      processTemplateString('{{yearsSince:missing}}', { foo: 2000, bar: 2010 })
    ).toThrow('Available variables: foo, bar')
  })

  it('throws error with "(none defined)" when no variables exist', () => {
    expect(() => processTemplateString('{{yearsSince:any}}', {})).toThrow(
      '(none defined)'
    )
  })

  describe('decimal-year (month-precision) variables', () => {
    it('floors a decimal start year using the current decimal year', () => {
      const decimalNow = getCurrentDecimalYear()
      const startYear = decimalNow - 4.2 // 4.2 years ago, decimal (non-integer)
      const result = processTemplateString('{{yearsSince:start}}', {
        start: startYear,
      })
      expect(result).toBe(String(Math.floor(decimalNow - startYear)))
      expect(result).toBe('4')
    })

    it('does not roll over to the next year until the anniversary month passes', () => {
      // A start date exactly 4 years and a few months in the future relative
      // to "now" within the same elapsed-year bucket should still floor to 4,
      // not jump to 5 just because the calendar year changed.
      const decimalNow = getCurrentDecimalYear()
      const justUnderFiveYearsAgo = decimalNow - 4.99
      const result = processTemplateString('{{yearsSince:start}}', {
        start: justUnderFiveYearsAgo,
      })
      expect(result).toBe('4')
    })

    it('whole-integer variables keep year-only precision (back-compat)', () => {
      // Integer years should behave exactly as before: simple year subtraction,
      // not decimal-aware, regardless of what month "now" is.
      const result = processTemplateString('{{yearsSince:start}}', {
        start: currentYear - 5,
      })
      expect(result).toBe('5')
    })
  })
})

describe('getCurrentDecimalYear', () => {
  it('returns a number between currentYear and currentYear + 1', () => {
    const decimalYear = getCurrentDecimalYear()
    const year = getCurrentYear()
    expect(decimalYear).toBeGreaterThanOrEqual(year)
    expect(decimalYear).toBeLessThan(year + 1)
  })
})

describe('roundYearsLabel', () => {
  // Matches the user's stated examples exactly:
  // 3.9 years -> "4" (rounds up, no plus since it's not yet past 4)
  // 4.2 years -> "4+" (rounds to 4, but is past it, so a plus is shown)
  it('rounds 3.9 to "4" with no plus', () => {
    expect(roundYearsLabel(3.9)).toBe('4')
  })

  it('rounds 4.2 to "4+" with a plus', () => {
    expect(roundYearsLabel(4.2)).toBe('4+')
  })

  it('shows no plus on an exact whole-year value', () => {
    expect(roundYearsLabel(4.0)).toBe('4')
  })

  it('shows a plus for any value past the rounded whole year, however small', () => {
    expect(roundYearsLabel(4.01)).toBe('4+')
    expect(roundYearsLabel(4.49)).toBe('4+')
  })

  it('rounds the .5 boundary up to the next year with a plus', () => {
    expect(roundYearsLabel(4.5)).toBe('5')
  })

  it('handles zero', () => {
    expect(roundYearsLabel(0)).toBe('0')
  })

  it('handles values rounding down to a lower whole number', () => {
    // 2.99 is closer to 3, so it should still round to "3" not "2"
    expect(roundYearsLabel(2.99)).toBe('3')
  })
})

describe('yearsSincePlus template token', () => {
  it('produces a no-plus label when just under a whole year (3.9 -> "4")', () => {
    const decimalNow = getCurrentDecimalYear()
    const startYear = decimalNow - 3.9
    const result = processTemplateString('{{yearsSincePlus:start}}', {
      start: startYear,
    })
    expect(result).toBe('4')
  })

  it('produces a plus label when meaningfully past a whole year (4.2 -> "4+")', () => {
    const decimalNow = getCurrentDecimalYear()
    const startYear = decimalNow - 4.2
    const result = processTemplateString('{{yearsSincePlus:start}}', {
      start: startYear,
    })
    expect(result).toBe('4+')
  })

  it('works alongside surrounding text', () => {
    const decimalNow = getCurrentDecimalYear()
    const startYear = decimalNow - 4.2
    const result = processTemplateString(
      '{{yearsSincePlus:start}} years of experience',
      { start: startYear }
    )
    expect(result).toBe('4+ years of experience')
  })

  it('handles whole-integer start years the same as yearsSince (no decimal precision)', () => {
    const currentYear = getCurrentYear()
    const result = processTemplateString('{{yearsSincePlus:start}}', {
      start: currentYear - 5,
    })
    expect(result).toBe('5')
  })

  it('throws for an unknown variable, matching yearsSince behavior', () => {
    expect(() =>
      processTemplateString('{{yearsSincePlus:missing}}', { known: 2000 })
    ).toThrow('Unknown template variable "missing"')
  })

  it('can be combined with a plain yearsSince token in the same string', () => {
    const decimalNow = getCurrentDecimalYear()
    const result = processTemplateString(
      '{{yearsSincePlus:a}} rounded, {{yearsSince:b}} floored',
      { a: decimalNow - 4.2, b: decimalNow - 4.2 }
    )
    expect(result).toBe('4+ rounded, 4 floored')
  })
})


describe('processTemplates', () => {
  const currentYear = getCurrentYear()
  const variables = { start: 2000 }

  it('processes string values', () => {
    const result = processTemplates('{{yearsSince:start}} years', variables)
    expect(result).toBe(`${currentYear - 2000} years`)
  })

  it('processes nested objects', () => {
    const result = processTemplates(
      {
        outer: {
          inner: '{{yearsSince:start}} years',
        },
      },
      variables
    )
    expect(result).toEqual({
      outer: {
        inner: `${currentYear - 2000} years`,
      },
    })
  })

  it('processes arrays', () => {
    const result = processTemplates(
      ['{{yearsSince:start}}', 'plain text'],
      variables
    )
    expect(result).toEqual([`${currentYear - 2000}`, 'plain text'])
  })

  it('handles mixed nested structures', () => {
    const result = processTemplates(
      {
        array: [{ text: '{{yearsSince:start}}' }],
        value: 42,
        nested: { deep: '{{yearsSince:start}}+' },
      },
      variables
    )
    expect(result).toEqual({
      array: [{ text: `${currentYear - 2000}` }],
      value: 42,
      nested: { deep: `${currentYear - 2000}+` },
    })
  })

  it('returns primitives unchanged', () => {
    expect(processTemplates(42, variables)).toBe(42)
    expect(processTemplates(true, variables)).toBe(true)
    expect(processTemplates(null, variables)).toBe(null)
  })
})

// ============================================================================
// METRIC VALUE RESOLUTION TESTS
// ============================================================================

describe('resolveMetricValue', () => {
  const currentYear = getCurrentYear()

  it('returns number values unchanged', () => {
    expect(resolveMetricValue(42, {})).toBe(42)
    expect(resolveMetricValue(0, {})).toBe(0)
    expect(resolveMetricValue(-5, {})).toBe(-5)
  })

  it('resolves template string to number', () => {
    const result = resolveMetricValue('{{yearsSince:start}}', { start: 2000 })
    expect(result).toBe(currentYear - 2000)
  })

  it('throws error for non-numeric template result', () => {
    // This would require a template that resolves to NaN
    // Since yearsSince always produces a number, we test with a string that parses to NaN
    expect(() => resolveMetricValue('not-a-number', {})).toThrow('not a number')
  })
})

describe('resolveMetrics', () => {
  const currentYear = getCurrentYear()
  const variables = { start: 2000 }

  it('returns empty array for undefined metrics', () => {
    expect(resolveMetrics(undefined, variables)).toEqual([])
  })

  it('resolves numeric metric values', () => {
    const metrics = [{ value: 42, suffix: '%', label: 'Growth' }]
    const result = resolveMetrics(metrics, variables)
    expect(result).toEqual([
      {
        value: 42,
        suffix: '%',
        label: 'Growth',
        description: undefined,
        max: undefined,
        link: undefined,
        achievementId: undefined,
        backContent: undefined,
      },
    ])
  })

  it('resolves template metric values', () => {
    const metrics = [
      { value: '{{yearsSince:start}}', suffix: '+', label: 'Years' },
    ]
    const result = resolveMetrics(metrics, variables)
    expect(result[0].value).toBe(currentYear - 2000)
    expect(result[0].suffix).toBe('+')
    expect(result[0].label).toBe('Years')
  })

  it('uses empty string for missing suffix', () => {
    const metrics = [{ value: 10, label: 'Count', suffix: '' }]
    const result = resolveMetrics(metrics, variables)
    expect(result[0].suffix).toBe('')
  })

  it('preserves optional fields', () => {
    const metrics = [
      {
        value: 50,
        suffix: '%',
        label: 'Score',
        description: 'A description',
        max: 100,
        link: '/details',
        achievementId: 'ach-1',
      },
    ]
    const result = resolveMetrics(metrics, variables)
    expect(result[0].description).toBe('A description')
    expect(result[0].max).toBe(100)
    expect(result[0].link).toBe('/details')
    expect(result[0].achievementId).toBe('ach-1')
  })

  it('processes templates in backContent', () => {
    const metrics = [
      {
        value: 10,
        label: 'Metric',
        suffix: '',
        backContent: {
          title: '{{yearsSince:start}} years',
          category: 'leadership' as const,
          impact: 'High impact',
          details: ['Detail 1', '{{yearsSince:start}}+'],
        },
      },
    ]
    const result = resolveMetrics(metrics, variables)
    expect(result[0].backContent?.title).toBe(`${currentYear - 2000} years`)
    expect(result[0].backContent?.details[1]).toBe(`${currentYear - 2000}+`)
  })
})

// ============================================================================
// SKILL NORMALIZATION TESTS
// ============================================================================

describe('normalizeSkillCategories', () => {
  const variables = { start: 2000 }
  const currentYear = getCurrentYear()

  it('returns empty array for undefined categories', () => {
    expect(normalizeSkillCategories(undefined, variables)).toEqual([])
  })

  it('normalizes string skills to objects', () => {
    const categories = [
      {
        name: 'Languages',
        skills: ['TypeScript', 'Python'],
      },
    ]
    const result = normalizeSkillCategories(categories, variables)
    expect(result).toEqual([
      {
        name: 'Languages',
        icon: undefined,
        skills: [{ name: 'TypeScript' }, { name: 'Python' }],
      },
    ])
  })

  it('preserves object skills with all properties', () => {
    const categories = [
      {
        name: 'Frameworks',
        icon: 'code',
        skills: [
          {
            name: 'React',
            level: 'expert' as const,
            years: 8,
            context: 'Building SPAs',
            aliases: ['ReactJS'],
            weight: 9,
          },
        ],
      },
    ]
    const result = normalizeSkillCategories(categories, variables)
    expect(result[0].skills[0]).toEqual({
      name: 'React',
      level: 'expert',
      years: 8,
      context: 'Building SPAs',
      aliases: ['ReactJS'],
      weight: 9,
    })
  })

  it('processes template strings in context', () => {
    const categories = [
      {
        name: 'Tech',
        skills: [
          {
            name: 'Skill',
            context: '{{yearsSince:start}}+ years experience',
          },
        ],
      },
    ]
    const result = normalizeSkillCategories(categories, variables)
    expect(result[0].skills[0].context).toBe(
      `${currentYear - 2000}+ years experience`
    )
  })

  it('handles mixed string and object skills', () => {
    const categories = [
      {
        name: 'Mixed',
        skills: ['Plain', { name: 'Detailed', weight: 8 }],
      },
    ]
    const result = normalizeSkillCategories(categories, variables)
    expect(result[0].skills).toEqual([
      { name: 'Plain' },
      { name: 'Detailed', weight: 8 },
    ])
  })

  it('preserves category icon', () => {
    const categories = [{ name: 'Test', icon: 'settings', skills: ['One'] }]
    const result = normalizeSkillCategories(categories, variables)
    expect(result[0].icon).toBe('settings')
  })
})

// ============================================================================
// CROSS-VALIDATION TESTS
// ============================================================================

describe('validateNavProjectsConsistency', () => {
  it('passes when navigation has no projects link', () => {
    const navLinks = [
      { href: '#hero' },
      { href: '#experience' },
      { href: '#contact' },
    ]
    const projects: unknown[] = []

    expect(() =>
      validateNavProjectsConsistency(navLinks, projects)
    ).not.toThrow()
  })

  it('passes when navigation has projects link and projects exist', () => {
    const navLinks = [
      { href: '#hero' },
      { href: '#projects' },
      { href: '#contact' },
    ]
    const projects = [{ id: 'project-1', title: 'My Project' }]

    expect(() =>
      validateNavProjectsConsistency(navLinks, projects)
    ).not.toThrow()
  })

  it('throws when navigation has projects link but no projects', () => {
    const navLinks = [
      { href: '#hero' },
      { href: '#projects' },
      { href: '#contact' },
    ]
    const projects: unknown[] = []

    expect(() => validateNavProjectsConsistency(navLinks, projects)).toThrow(
      'Configuration error: Navigation has #projects link but no projects defined'
    )
  })

  it('throws with helpful error message', () => {
    const navLinks = [{ href: '#projects' }]
    const projects: unknown[] = []

    expect(() => validateNavProjectsConsistency(navLinks, projects)).toThrow(
      'Either add projects to content.json or remove the Projects link from site.json'
    )
  })

  it('passes with empty navigation links', () => {
    const navLinks: Array<{ href: string }> = []
    const projects: unknown[] = []

    expect(() =>
      validateNavProjectsConsistency(navLinks, projects)
    ).not.toThrow()
  })

  it('throws when projects exist but navigation has no projects link', () => {
    const navLinks = [
      { href: '#hero' },
      { href: '#experience' },
      { href: '#contact' },
    ]
    const projects = [{ id: 'project-1', title: 'My Project' }]

    expect(() => validateNavProjectsConsistency(navLinks, projects)).toThrow(
      'Configuration error: Projects are defined in content.json but navigation has no #projects link'
    )
  })

  it('throws with helpful error message for orphaned projects', () => {
    const navLinks = [{ href: '#hero' }]
    const projects = [{ id: 'project-1' }]

    expect(() => validateNavProjectsConsistency(navLinks, projects)).toThrow(
      'Either add a Projects link to site.json navigation or remove projects from content.json'
    )
  })
})

describe('experienceDescription', () => {
  // Regression coverage for a bug found in code review: this auto-generated
  // fallback (used when content.json doesn't set experienceSection.description,
  // which is the case for this site) still referenced the old un-rounded
  // yearsOfExperience with a hardcoded "+", bypassing the rounding fix
  // entirely, and used generic leftover template copy ("leading
  // high-performing engineering teams") that doesn't describe this role.
  it('uses the rounded years label, not a hardcoded plus', () => {
    // yearsOfExperienceLabel already has its own conditional "+" baked in
    // (e.g. "4" or "4+") — the description should contain that label
    // as-is, and must not contain a *second*, redundant "+" appended after it.
    expect(experienceDescription).toContain(yearsOfExperienceLabel)
    expect(experienceDescription).not.toContain(`${yearsOfExperienceLabel}+`)
  })

  it('does not contain the generic leftover template copy', () => {
    expect(experienceDescription).not.toContain('world-class software')
    expect(experienceDescription).not.toContain(
      'leading high-performing engineering teams'
    )
  })

  it('is a non-empty, sensible sentence', () => {
    expect(experienceDescription.trim().length).toBeGreaterThan(10)
    expect(experienceDescription.trim().endsWith('.')).toBe(true)
  })
})
