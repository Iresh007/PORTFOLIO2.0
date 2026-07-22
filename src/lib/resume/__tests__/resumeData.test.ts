import { describe, it, expect } from 'vitest'
import {
  resumeSummaryTemplate,
  resumeEducation,
  resumeAwards,
  resumePhone,
} from '../resumeData'

describe('resumeSummaryTemplate', () => {
  it('interpolates a no-plus rounded years label as-is, without adding its own plus', () => {
    const summary = resumeSummaryTemplate('4')
    expect(summary).toContain('4 years')
    expect(summary).not.toContain('4+ years')
  })

  it('interpolates a years label that already includes a conditional plus as-is', () => {
    const summary = resumeSummaryTemplate('4+')
    expect(summary).toContain('4+ years')
  })

  it('updates when a different years label is passed', () => {
    const summaryAt3 = resumeSummaryTemplate('3+')
    const summaryAt5 = resumeSummaryTemplate('5+')
    expect(summaryAt3).toContain('3+ years')
    expect(summaryAt5).toContain('5+ years')
    expect(summaryAt3).not.toBe(summaryAt5)
  })

  it('mentions the core technologies and certifications', () => {
    const summary = resumeSummaryTemplate('4')
    expect(summary).toContain('Azure Databricks')
    expect(summary).toContain('Snowflake')
    expect(summary).toContain('Data Vault 2.0')
    expect(summary).toContain('Databricks Data Engineer Professional')
  })
})

describe('resumeEducation', () => {
  it('has at least one entry with required fields', () => {
    expect(resumeEducation.length).toBeGreaterThan(0)
    for (const edu of resumeEducation) {
      expect(edu.degree).toBeTruthy()
      expect(edu.institution).toBeTruthy()
      expect(edu.period).toBeTruthy()
    }
  })
})

describe('resumeAwards', () => {
  it('has at least one entry with required fields', () => {
    expect(resumeAwards.length).toBeGreaterThan(0)
    for (const award of resumeAwards) {
      expect(award.title).toBeTruthy()
      expect(award.issuer).toBeTruthy()
    }
  })
})

describe('resumePhone', () => {
  it('is a non-empty string', () => {
    expect(resumePhone.length).toBeGreaterThan(0)
  })
})
