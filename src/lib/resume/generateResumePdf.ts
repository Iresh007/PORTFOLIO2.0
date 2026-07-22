import { jsPDF } from 'jspdf'
import {
  pdfHeroName,
  pdfHeroTitle,
  pdfYearsLabel,
  pdfEmail,
  pdfLinkedIn,
  pdfExperience,
  pdfCertifications,
  pdfSkillCategories,
} from './pdfData'
import {
  resumePhone,
  resumeEducation,
  resumeAwards,
  resumeSummaryTemplate,
} from './resumeData'

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN_X = 18
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2
const BOTTOM_LIMIT = PAGE_HEIGHT - 16

const NAVY: [number, number, number] = [16, 42, 67]
const BRASS: [number, number, number] = [180, 132, 56]
const SLATE: [number, number, number] = [71, 85, 105]
const SLATE_LIGHT: [number, number, number] = [120, 132, 148]
const LINE_GRAY: [number, number, number] = [210, 216, 224]

export function generateResumePdf(): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = 16

  const ensureSpace = (needed: number) => {
    if (y + needed > BOTTOM_LIMIT) {
      doc.addPage()
      y = 16
    }
  }

  const hr = (color: [number, number, number] = LINE_GRAY, weight = 0.3) => {
    doc.setDrawColor(...color)
    doc.setLineWidth(weight)
    doc.line(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y)
  }

  const sectionHeading = (title: string) => {
    ensureSpace(12)
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...NAVY)
    doc.text(title.toUpperCase(), MARGIN_X, y)
    y += 2
    hr(NAVY, 0.5)
    y += 6
  }

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...NAVY)
  doc.text(pdfHeroName.toUpperCase(), PAGE_WIDTH / 2, y, { align: 'center' })
  y += 7

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(10.5)
  doc.setTextColor(...SLATE)
  doc.text(
    `${pdfHeroTitle}  |  Azure Databricks \u2022 Snowflake \u2022 Data Vault 2.0 \u2022 ADF`,
    PAGE_WIDTH / 2, y, { align: 'center' }
  )
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...SLATE_LIGHT)
  const contactLine = [
    resumePhone,
    pdfEmail,
    pdfLinkedIn.replace(/^https?:\/\//, ''),
    'Gurgaon, India | Open to Relocation (PAN India)',
  ].filter(Boolean).join('   \u2022   ')
  const contactLines = doc.splitTextToSize(contactLine, CONTENT_WIDTH)
  doc.text(contactLines, PAGE_WIDTH / 2, y, { align: 'center' })
  y += contactLines.length * 4.2 + 4
  hr(NAVY, 0.6)
  y += 2

  // Summary
  sectionHeading('Professional Summary')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...SLATE)
  const summary = resumeSummaryTemplate(pdfYearsLabel)
  const summaryLines = doc.splitTextToSize(summary, CONTENT_WIDTH)
  ensureSpace(summaryLines.length * 4.6)
  doc.text(summaryLines, MARGIN_X, y)
  y += summaryLines.length * 4.6 + 2

  // Skills
  sectionHeading('Technical Skills')
  doc.setFontSize(9.2)
  for (const category of pdfSkillCategories) {
    const skillNames = category.skills.join(', ')
    const labelWidth = 42
    const labelLines = doc.splitTextToSize(category.name, labelWidth - 3)
    const valueLines = doc.splitTextToSize(skillNames, CONTENT_WIDTH - labelWidth)
    const rowLines = Math.max(labelLines.length, valueLines.length)
    ensureSpace(rowLines * 4.4 + 1)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...NAVY)
    doc.text(labelLines, MARGIN_X, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...SLATE)
    doc.text(valueLines, MARGIN_X + labelWidth, y)
    y += rowLines * 4.4 + 1.5
  }
  y += 2

  // Experience
  sectionHeading('Professional Experience')
  for (const job of pdfExperience) {
    ensureSpace(14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...NAVY)
    doc.text(job.role, MARGIN_X, y)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(...SLATE_LIGHT)
    doc.text(job.period, PAGE_WIDTH - MARGIN_X, y, { align: 'right' })
    y += 4.6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...BRASS)
    doc.text(job.company, MARGIN_X, y)
    y += 4.2
    if (job.location) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8.5)
      doc.setTextColor(...SLATE_LIGHT)
      doc.text(job.location, MARGIN_X, y)
      y += 4.4
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...SLATE)
    for (const highlight of job.highlights) {
      const bulletLines = doc.splitTextToSize(highlight, CONTENT_WIDTH - 5)
      ensureSpace(bulletLines.length * 4.3 + 1)
      doc.text('\u2022', MARGIN_X, y)
      doc.text(bulletLines, MARGIN_X + 4, y)
      y += bulletLines.length * 4.3 + 1
    }
    y += 3
  }

  // Certifications & Awards
  const estimatedCertHeight = pdfCertifications.length * 5.5 + 8
  const estimatedAwardHeight = resumeAwards.reduce(
    (sum, a) => sum + (a.description ? 9 : 5.5), 0
  ) + 8
  const estimatedSectionHeight = Math.max(estimatedCertHeight, estimatedAwardHeight) + 16
  ensureSpace(estimatedSectionHeight)
  sectionHeading('Certifications & Awards')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...NAVY)
  const colWidth = CONTENT_WIDTH / 2 - 4
  const certColX = MARGIN_X
  const awardColX = MARGIN_X + CONTENT_WIDTH / 2 + 4
  const colStartY = y

  doc.text('Certifications', certColX, y)
  let certY = y + 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.8)
  doc.setTextColor(...SLATE)
  for (const cert of pdfCertifications) {
    const lines = doc.splitTextToSize(cert.name, colWidth - 4)
    doc.text('\u2022', certColX, certY)
    doc.text(lines, certColX + 4, certY)
    certY += lines.length * 4.1 + 1
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...NAVY)
  doc.text('Awards', awardColX, colStartY)
  let awardY = colStartY + 5
  for (const award of resumeAwards) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.8)
    doc.setTextColor(...SLATE)
    const titleLines = doc.splitTextToSize(
      `${award.title} \u2014 ${award.issuer}`, colWidth - 4
    )
    doc.text('\u2022', awardColX, awardY)
    doc.text(titleLines, awardColX + 4, awardY)
    awardY += titleLines.length * 4.1
    if (award.description) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8.2)
      doc.setTextColor(...SLATE_LIGHT)
      const descLines = doc.splitTextToSize(award.description, colWidth - 4)
      doc.text(descLines, awardColX + 4, awardY)
      awardY += descLines.length * 3.8
    }
    awardY += 1.5
  }
  y = Math.max(certY, awardY) + 2

  // Education
  sectionHeading('Education')
  for (const edu of resumeEducation) {
    ensureSpace(9)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...NAVY)
    doc.text(edu.degree, MARGIN_X, y)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(...SLATE_LIGHT)
    doc.text(edu.period, PAGE_WIDTH - MARGIN_X, y, { align: 'right' })
    y += 4.4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...SLATE)
    doc.text(edu.institution, MARGIN_X, y)
    y += 6
  }

  doc.save(`${pdfHeroName.replace(/\s+/g, '_')}_Resume.pdf`)
}
