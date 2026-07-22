import { jsPDF } from 'jspdf'
import { pdfHeroName, pdfHeroTitle, pdfYearsLabel, pdfEmail, pdfLinkedIn } from './pdfData'
import { resumePhone } from './resumeData'

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN_X = 22
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2
const BOTTOM_LIMIT = PAGE_HEIGHT - 18

const INK: [number, number, number] = [30, 30, 30]
const MUTED: [number, number, number] = [90, 90, 90]

/**
 * Build the cover letter body paragraphs. Years of experience and the
 * addressed company name are interpolated fresh at generation time.
 */
export function buildParagraphs(
  companyName: string,
  yearsLabel: string
): string[] {
  return [
    `I am writing to express my strong interest in the Senior Data Engineer position at ${companyName}. As a results-driven data engineer with ${yearsLabel} years of experience architecting cloud-native data platforms, I have a track record of delivering measurable impact — including a 62.5% pipeline performance improvement, 100% on-time release delivery, and zero production rollbacks across retail and insurance clients.`,

    `In my current role as Senior Data Engineer at EXL Services, I build Data Vault 2.0 models in Snowflake for a global insurance provider — designing and implementing Raw Vault, Business Vault, and Clean Vault layers across multiple subject areas that support regulatory reporting and executive BI. I have run 20+ schema deployments through Jenkins and GitHub using XML-based master changelogs with zero failed releases, and built shell-scripted ingestion pipelines that removed environment-specific configuration entirely.`,

    `Previously, as Associate Consultant at Capgemini, I led a Unity Catalog migration for a 50TB Azure Databricks data lake supporting a global FMCG/retail client. Rebuilding the pipeline estate on Medallion Architecture (Bronze-Silver-Gold) cut pipeline execution time by 62.5% and reduced production defects by 98%. I also rewrote 100+ Azure Data Factory pipelines using PySpark and SQL, increasing throughput by 40% and cutting latency by 50% for time-critical retail analytics feeds, while owning the end-to-end CI/CD lifecycle for 10+ production releases with zero rollbacks.`,

    `My technical background spans Azure Databricks, Snowflake, and Azure Data Factory, with particular depth in Data Vault 2.0 and Medallion Architecture design patterns, PySpark-based ETL/ELT development, and Jenkins/Azure DevOps-driven release governance. I am Databricks Certified Data Engineer Professional and Microsoft Certified Azure Data Engineer Associate (DP-203), with additional certifications in Azure Fundamentals and Databricks Generative AI.`,

    `I would welcome the opportunity to bring this experience to ${companyName} and discuss how I can contribute to your data engineering team. Thank you for considering my application.`,
  ]
}

export function generateCoverLetterPdf(companyName: string): void {
  const trimmedCompany = companyName.trim()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = 22

  const ensureSpace = (needed: number) => {
    if (y + needed > BOTTOM_LIMIT) {
      doc.addPage()
      y = 22
    }
  }

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...INK)
  doc.text(pdfHeroName.toUpperCase(), MARGIN_X, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.text(pdfHeroTitle, MARGIN_X, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...MUTED)
  doc.text(`Phone: ${resumePhone}  |  Email: ${pdfEmail}`, MARGIN_X, y)
  y += 5
  doc.text(
    `LinkedIn: ${pdfLinkedIn.replace(/^https?:\/\//, '')}`,
    MARGIN_X,
    y
  )
  y += 10

  doc.setTextColor(...INK)
  doc.setFontSize(9.5)
  doc.text('Hiring Manager', MARGIN_X, y)
  y += 5
  const companyAddressLines = doc.splitTextToSize(trimmedCompany, CONTENT_WIDTH)
  doc.text(companyAddressLines, MARGIN_X, y)
  y += companyAddressLines.length * 4.5 + 4

  doc.setFont('helvetica', 'bold')
  const reLine = doc.splitTextToSize(
    `Re: Application for Senior Data Engineer Position at ${trimmedCompany}`,
    CONTENT_WIDTH
  )
  ensureSpace(reLine.length * 5)
  doc.text(reLine, MARGIN_X, y)
  y += reLine.length * 5 + 4

  doc.setFont('helvetica', 'normal')
  doc.text('Dear Hiring Manager,', MARGIN_X, y)
  y += 8

  const paragraphs = buildParagraphs(trimmedCompany, pdfYearsLabel)
  doc.setFontSize(9.7)
  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph, CONTENT_WIDTH)
    ensureSpace(lines.length * 4.6 + 5)
    doc.text(lines, MARGIN_X, y)
    y += lines.length * 4.6 + 5
  }

  ensureSpace(16)
  doc.text('Sincerely,', MARGIN_X, y)
  y += 9
  doc.setFont('helvetica', 'bold')
  doc.text(pdfHeroName, MARGIN_X, y)

  const safeCompany = trimmedCompany.replace(/[^a-zA-Z0-9]+/g, '_') || 'Company'
  doc.save(
    `${pdfHeroName.replace(/\s+/g, '_')}_Cover_Letter_${safeCompany}.pdf`
  )
}
