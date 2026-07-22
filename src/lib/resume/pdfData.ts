/**
 * Slim data reader for PDF generation.
 *
 * Imports content.json and site.json directly (raw JSON, ~15KB total)
 * instead of going through @/config/loader which also imports
 * design-systems.json (~350KB). This keeps the PDF download chunks
 * lightweight — the full loader is only needed at app-render time,
 * not for generating a download.
 *
 * The types are intentional minimal slices — we only pull what the
 * PDF generators actually need.
 */

import rawContent from '@/config/content.json'
import rawSite from '@/config/site.json'

// ── Types ────────────────────────────────────────────────────────────────────

interface ContentJson {
  variables?: Record<string, number>
  hero?: {
    name?: string
    title?: string
  }
  experience?: Array<{
    company: string
    role: string
    period: string
    location?: string
    highlights?: string[]
    techStack?: string[]
  }>
  certifications?: Array<{
    id: string
    name: string
    issuer: string
    date?: string
  }>
  skillCategories?: Array<{
    name: string
    skills: Array<{ name: string }>
  }>
}

interface SiteJson {
  social?: Array<{
    platform: string
    url?: string
    value?: string
  }>
  structuredData?: {
    address?: {
      locality?: string
    }
  }
}

const content = rawContent as ContentJson
const site = rawSite as SiteJson

// ── Year calculation (mirrors loader.ts logic, no import needed) ─────────────

function getCurrentDecimalYear(): number {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime()
  const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1).getTime()
  const fraction = (now.getTime() - startOfYear) / (startOfNextYear - startOfYear)
  return now.getFullYear() + fraction
}

function roundYearsLabel(decimal: number): string {
  const rounded = Math.round(decimal)
  const plus = decimal > rounded ? '+' : ''
  return `${rounded}${plus}`
}

function resolveYearsLabel(): string {
  const startYear = content.variables?.careerStartYear
  if (!startYear) return '4+'
  const elapsed = getCurrentDecimalYear() - startYear
  return roundYearsLabel(elapsed)
}

// ── Exports used by PDF generators ──────────────────────────────────────────

export const pdfHeroName = content.hero?.name ?? 'Iresh Agrawal'
export const pdfHeroTitle = content.hero?.title ?? 'Senior Data Engineer'
export const pdfYearsLabel = resolveYearsLabel()

export const pdfEmail =
  site.social?.find((s) => s.platform === 'email')?.value ??
  'iresh.agrawal23@gmail.com'

export const pdfLinkedIn =
  site.social?.find((s) => s.platform === 'linkedin')?.url ??
  'https://www.linkedin.com/in/iresh-agrawal23'

export const pdfExperience = (content.experience ?? []).map((exp) => ({
  company: exp.company,
  role: exp.role,
  period: exp.period,
  location: exp.location,
  highlights: exp.highlights ?? [],
  techStack: exp.techStack ?? [],
}))

export const pdfCertifications = (content.certifications ?? []).map((c) => ({
  name: c.name,
  issuer: c.issuer,
}))

export const pdfSkillCategories = (content.skillCategories ?? []).map((cat) => ({
  name: cat.name,
  skills: cat.skills.map((s) => s.name),
}))
