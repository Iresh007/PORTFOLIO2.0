/**
 * Resume-only supplementary data.
 *
 * The web portfolio (content.json) intentionally omits some fields that a
 * downloadable resume needs — education, awards, and a phone number aren't
 * shown anywhere on the site itself. They live here instead of bloating the
 * shared content schema with resume-specific fields.
 *
 * Everything else (name, title, experience, certifications, skills, contact
 * email/LinkedIn) is sourced from `@/config/loader` so the resume and the
 * website can never drift out of sync.
 */

export interface ResumeEducation {
  degree: string
  institution: string
  period: string
}

export interface ResumeAward {
  title: string
  issuer: string
  description?: string
}

export const resumePhone = '+91 870-748-1550'

export const resumeEducation: ResumeEducation[] = [
  {
    degree: 'B.Tech – Electronics & Communication Engineering',
    institution: 'Vellore Institute of Technology (VIT), Bhopal',
    period: 'Jul 2018 - Sep 2022',
  },
]

export const resumeAwards: ResumeAward[] = [
  {
    title: 'Exceeding Expectations Award',
    issuer: 'EXL Services',
    description: 'Snowflake Data Vault 2.0 modeling and CI/CD governance',
  },
  {
    title: 'Silver Star Award (2x)',
    issuer: 'Capgemini',
    description: 'Unity Catalog migration and sustained SLA compliance',
  },
]

export const resumeSummaryTemplate = (yearsLabel: string) =>
  `Data Engineer with ${yearsLabel} years building cloud data platforms on Azure Databricks, Snowflake, and Azure Data Factory. Core focus is Data Vault 2.0 and Medallion Architecture — both from scratch and large-scale migrations. At Capgemini, migrated a 50TB Databricks data lake to Unity Catalog and cut pipeline execution time by 62.5%. At EXL, manages Snowflake schema releases across multiple insurance lines: 20+ deployments, zero rollbacks. Certified Databricks Data Engineer Professional and Microsoft Azure Data Engineer (DP-203).`
