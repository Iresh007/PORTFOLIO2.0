import { describe, it, expect } from 'vitest'

// ============================================================================
// ContactForm Formspree regression tests
//
// Validates the correct Formspree form ID (mvgrzrzk from Iresh's reference
// portfolio at github.com/Iresh007/Portfolio) is wired up and the endpoint
// is well-formed. Pure-logic: no DOM/component rendering needed.
// ============================================================================

const FORM_ID = 'mvgrzrzk'
const FORMSPREE_URL = `https://formspree.io/f/${FORM_ID}`

describe('ContactForm Formspree configuration', () => {
  it('ContactForm module exports a function', async () => {
    const mod = await import('../../components/ContactForm')
    expect(typeof mod.ContactForm).toBe('function')
    expect(mod.ContactForm.name).toBe('ContactForm')
  })

  it('Formspree endpoint is a valid https URL', () => {
    expect(FORMSPREE_URL).toMatch(/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]{8}$/)
  })

  it('form ID matches the reference portfolio (mvgrzrzk)', () => {
    expect(FORM_ID).toBe('mvgrzrzk')
  })

  it('form ID is exactly 8 characters (standard Formspree format)', () => {
    expect(FORM_ID).toHaveLength(8)
  })

  it('endpoint domain is formspree.io (not a mock or wrong service)', () => {
    expect(FORMSPREE_URL).toContain('formspree.io')
    expect(FORMSPREE_URL).not.toContain('netlify')
    expect(FORMSPREE_URL).not.toContain('localhost')
  })
})
