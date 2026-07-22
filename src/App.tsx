import { lazy, Suspense } from 'react'
import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'
import { LeadershipHighlights } from '@/components/LeadershipHighlights'
import { Experience } from '@/components/Experience'
import { Competencies } from '@/components/Competencies'
import { Certifications } from '@/components/Certifications'
import { Skills } from '@/components/Skills'
import { Projects } from '@/components/Projects'
import { Contact } from '@/components/Contact'
import { SectionNav } from '@/components/SectionNav'
import { ThemeChooserFAB } from '@/components/ThemeChooserFAB'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ThemeProvider } from '@/hooks/useTheme'
import { DesignSystemProvider } from '@/hooks/useDesignSystem'
import { LayoutProvider, useLayout } from '@/hooks/useLayout'
import { RouteViewProvider } from '@/hooks/useRouteView'
import { sections, features } from '@/config/loader'

// ── Cards layout (default, eager) ───────────────────────────────────────────
// All cards-layout components are part of the main bundle — they are always
// needed by the default Pipeline design system.
const cardSectionComponents: Record<string, React.FC> = {
  hero: Hero,
  metrics: LeadershipHighlights,
  experience: Experience,
  achievements: Competencies,
  skills: Skills,
  certifications: Certifications,
  projects: Projects,
  contact: Contact,
}

// ── Editorial + Concrete layouts (lazy) ─────────────────────────────────────
// These are only needed when a visitor explicitly switches to those layouts
// via the theme chooser. Lazy-loading them saves ~180KB from the initial
// bundle that would otherwise load on every page visit.
const EditorialLayout = lazy(() =>
  import('@/components/editorial').then((m) => ({
    default: function EditorialLayout({
      sectionId,
    }: {
      sectionId: string
    }) {
      const components: Record<string, React.FC> = {
        hero: m.EditorialHero,
        metrics: m.EditorialNumbers,
        experience: m.EditorialCareers,
        achievements: m.EditorialSelectedWork,
        skills: m.EditorialSkillsIndex,
        projects: m.EditorialProjects,
        contact: m.EditorialContact,
      }
      const C = components[sectionId]
      return C ? <C /> : null
    },
  }))
)

const ConcreteLayout = lazy(() =>
  import('@/components/concrete').then((m) => ({
    default: function ConcreteLayout({
      sectionId,
    }: {
      sectionId: string
    }) {
      const components: Record<string, React.FC> = {
        hero: m.ConcreteHero,
        metrics: m.ConcreteNumbers,
        experience: m.ConcreteCareers,
        achievements: m.ConcreteSelectedWork,
        skills: m.ConcreteSkillsIndex,
        projects: m.ConcreteProjects,
        contact: m.ConcreteContact,
      }
      const C = components[sectionId]
      return C ? <C /> : null
    },
  }))
)

// Lazy-load the top bars too — only needed for those layouts
const EditorialTopBar = lazy(() =>
  import('@/components/editorial').then((m) => ({ default: m.EditorialTopBar }))
)
const ConcreteTopBar = lazy(() =>
  import('@/components/concrete').then((m) => ({ default: m.ConcreteTopBar }))
)

// ── Section background alternation ──────────────────────────────────────────
const FIXED_BACKGROUND_SECTIONS = new Set(['hero'])

function getSectionBackground(
  sectionId: string,
  alternatingIndex: number
): string {
  if (FIXED_BACKGROUND_SECTIONS.has(sectionId)) return ''
  return alternatingIndex % 2 === 1 ? 'section-bg-card' : 'section-bg-slate'
}

// ── Portfolio view ───────────────────────────────────────────────────────────
function PortfolioView() {
  const { layout } = useLayout()
  const isEditorial = layout === 'editorial'
  const isConcrete = layout === 'concrete'
  const isCustomLayout = isEditorial || isConcrete

  let alternatingIndex = 0

  return (
    <>
      <a href="#hero" className="skip-link">
        Skip to main content
      </a>
      {!isCustomLayout && <Navigation />}
      {!isCustomLayout && <SectionNav />}

      {isEditorial && (
        <Suspense fallback={null}>
          <EditorialTopBar />
        </Suspense>
      )}
      {isConcrete && (
        <Suspense fallback={null}>
          <ConcreteTopBar />
        </Suspense>
      )}

      {features?.designSystemSwitcher && <ThemeChooserFAB />}

      <main>
        {sections.map((sectionId) => {
          // ── Custom layouts (editorial / concrete) ──
          if (isCustomLayout) {
            const LayoutComponent = isEditorial ? EditorialLayout : ConcreteLayout
            return (
              <Suspense key={sectionId} fallback={null}>
                <LayoutComponent sectionId={sectionId} />
              </Suspense>
            )
          }

          // ── Default cards layout ──
          const Component = cardSectionComponents[sectionId]
          if (!Component) {
            const availableSections = Object.keys(cardSectionComponents).join(', ')
            const errorMessage = `[Config] Unknown section: "${sectionId}". Available sections: ${availableSections}`
            console.error(errorMessage)
            if (import.meta.env.DEV) {
              return (
                <div
                  key={sectionId}
                  className="bg-red-100 dark:bg-red-900/30 p-6 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700 m-4 rounded-lg"
                >
                  <strong>Config Error:</strong> Unknown section &quot;{sectionId}&quot;
                  <br />
                  <span className="text-sm">Available: {availableSections}</span>
                </div>
              )
            }
            throw new Error(errorMessage)
          }

          const bgClass = getSectionBackground(sectionId, alternatingIndex)
          if (!FIXED_BACKGROUND_SECTIONS.has(sectionId)) alternatingIndex++

          return (
            <div key={sectionId} className={bgClass}>
              <Component />
            </div>
          )
        })}
      </main>
    </>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <DesignSystemProvider>
        <ThemeProvider>
          <LayoutProvider>
            <RouteViewProvider>
              <PortfolioView />
            </RouteViewProvider>
          </LayoutProvider>
        </ThemeProvider>
      </DesignSystemProvider>
    </ErrorBoundary>
  )
}

export default App
