import { useRef, useState, useEffect } from 'react'
import { Award, ExternalLink, BadgeCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { certifications, certificationsSection } from '@/config/loader'
import { cn } from '@/lib/utils'
import { usePipelineReveal } from '@/hooks/usePipelineReveal'

export function Certifications() {
  const pipelineRef = usePipelineReveal()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  if (certifications.length === 0) return null

  return (
    <section id="certifications" ref={pipelineRef} className="relative overflow-hidden section-padding">
      <div className="pipeline-flow-line" aria-hidden="true" />
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-accent dark:text-accent uppercase tracking-wider mb-3">
            {certificationsSection.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-foreground text-foreground mb-4">
            {certificationsSection.headline}
          </h2>
          {certificationsSection.description && (
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {certificationsSection.description}
            </p>
          )}
        </div>

        <div
          ref={sectionRef}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {certifications.map((cert, index) => (
            <Card
              key={cert.id}
              className={cn(
                'border-border hover:border-accent transition-all hover:shadow-lg',
                isVisible && 'animate-fade-in-up'
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 rounded-full bg-accent/10 p-2">
                    <Award className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-foreground leading-snug">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                      {cert.issuer}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {cert.date && (
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {cert.date}
                    </span>
                  )}
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1 ml-auto"
                    >
                      Verify
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
