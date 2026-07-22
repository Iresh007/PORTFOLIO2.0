import { describe, it, expect } from 'vitest'
import {
  pdfHeroName,
  pdfHeroTitle,
  pdfYearsLabel,
  pdfEmail,
  pdfLinkedIn,
  pdfExperience,
  pdfCertifications,
  pdfSkillCategories,
} from '../pdfData'

// pdfData is a slim reader that bypasses @/config/loader so the PDF
// download chunk doesn't drag in design-systems.json (~350KB). These
// tests pin that its values stay consistent with the app-level loader.

describe('pdfData slim reader', () => {
  it('exposes the hero name and title', () => {
    expect(pdfHeroName).toBe('Iresh Agrawal')
    expect(pdfHeroTitle).toBe('Senior Data Engineer')
  })

  it('years label matches the rounding convention (digits + optional plus)', () => {
    expect(pdfYearsLabel).toMatch(/^\d+\+?$/)
  })

  it('email and linkedin resolve from site.json social entries', () => {
    expect(pdfEmail).toContain('@')
    expect(pdfLinkedIn).toMatch(/^https:\/\/(www\.)?linkedin\.com\//)
  })

  it('experience entries are complete and ordered most-recent first', () => {
    expect(pdfExperience.length).toBeGreaterThanOrEqual(3)
    for (const job of pdfExperience) {
      expect(job.company).toBeTruthy()
      expect(job.role).toBeTruthy()
      expect(job.period).toBeTruthy()
      expect(Array.isArray(job.highlights)).toBe(true)
    }
    // Most recent role is the EXL Services senior position
    expect(pdfExperience[0].role).toContain('Senior')
  })

  it('certifications carry name and issuer (no dates, per site convention)', () => {
    expect(pdfCertifications.length).toBeGreaterThanOrEqual(4)
    for (const cert of pdfCertifications) {
      expect(cert.name).toBeTruthy()
      expect(cert.issuer).toBeTruthy()
      expect('date' in cert).toBe(false)
    }
  })

  it('skill categories flatten to plain string arrays', () => {
    expect(pdfSkillCategories.length).toBeGreaterThan(0)
    for (const cat of pdfSkillCategories) {
      expect(cat.name).toBeTruthy()
      expect(cat.skills.length).toBeGreaterThan(0)
      for (const s of cat.skills) expect(typeof s).toBe('string')
    }
  })

  it('matches loader values for name and years (consistency check)', async () => {
    const loader = await import('@/config/loader')
    expect(pdfHeroName).toBe(loader.hero.name)
    expect(pdfYearsLabel).toBe(loader.yearsOfExperienceLabel)
  })
})
