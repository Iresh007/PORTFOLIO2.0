import { describe, it, expect } from 'vitest'
import { buildParagraphs } from '../generateCoverLetterPdf'

describe('buildParagraphs', () => {
  it('interpolates the company name into the opening and closing paragraphs', () => {
    const paragraphs = buildParagraphs('Acme Corp', '4')
    expect(paragraphs[0]).toContain('Acme Corp')
    expect(paragraphs[paragraphs.length - 1]).toContain('Acme Corp')
  })

  it('interpolates a rounded (no-plus) years-of-experience label as-is', () => {
    const paragraphs = buildParagraphs('Acme Corp', '4')
    expect(paragraphs[0]).toContain('4 years')
    expect(paragraphs[0]).not.toContain('4+ years')
  })

  it('interpolates a years-of-experience label with a conditional plus as-is', () => {
    const paragraphs = buildParagraphs('Acme Corp', '4+')
    expect(paragraphs[0]).toContain('4+ years')
  })

  it('updates both company name and years label when different values are passed', () => {
    const first = buildParagraphs('Acme Corp', '4')
    const second = buildParagraphs('Globex Inc', '6+')
    expect(second[0]).toContain('Globex Inc')
    expect(second[0]).toContain('6+ years')
    expect(first[0]).not.toBe(second[0])
  })

  it('produces a non-empty set of paragraphs every time', () => {
    const paragraphs = buildParagraphs('Test Co', '5')
    expect(paragraphs.length).toBeGreaterThan(0)
    for (const p of paragraphs) {
      expect(p.trim().length).toBeGreaterThan(0)
    }
  })

  it('mentions key certifications and technologies', () => {
    const paragraphs = buildParagraphs('Test Co', '4')
    const joined = paragraphs.join(' ')
    expect(joined).toContain('Databricks Certified Data Engineer Professional')
    expect(joined).toContain('Azure Data Engineer Associate (DP-203)')
    expect(joined).toContain('Data Vault 2.0')
  })
})

describe('long company name page-width regression', () => {
  // Regression coverage for a bug found in code review: the "Re:" line and
  // the company address line were rendered with doc.text() directly
  // (no wrapping), so a long company name silently ran off the page width
  // instead of throwing — meaning the earlier "doesn't throw" smoke test
  // didn't actually catch it. This asserts the wrapping math itself: any
  // line longer than the printable width must split into multiple lines.
  const PAGE_WIDTH = 210
  const MARGIN_X = 22
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2
  const LONG_COMPANY =
    'A Very Long International Conglomerate Holdings Company Name Limited'

  it('the Re: line wraps to multiple lines for a long company name', async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const reLine = `Re: Application for Senior Data Engineer Position at ${LONG_COMPANY}`
    const lines = doc.splitTextToSize(reLine, CONTENT_WIDTH)
    expect(lines.length).toBeGreaterThan(1)
  })

  it('the company address line wraps to multiple lines for a long company name', async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const lines = doc.splitTextToSize(LONG_COMPANY, CONTENT_WIDTH)
    expect(lines.length).toBeGreaterThan(1)
  })

  it('a short, typical company name stays on a single line (no unnecessary wrapping)', async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const reLine = 'Re: Application for Senior Data Engineer Position at Acme Corp'
    const lines = doc.splitTextToSize(reLine, CONTENT_WIDTH)
    expect(lines.length).toBe(1)
  })
})
