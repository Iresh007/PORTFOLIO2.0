import { useState, useRef, useEffect } from 'react'
import { MapPin, Calendar, ChevronDown, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  experience,
  experienceSection,
  experienceDescription,
} from '@/config/loader'
import { cn } from '@/lib/utils'
import { usePipelineReveal } from '@/hooks/usePipelineReveal'

export function Experience() {
  const pipelineRef = usePipelineReveal()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

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

  // Return null if no experience to display
  if (experience.length === 0) return null

  return (
    <section id="experience" ref={pipelineRef} className="relative overflow-hidden section-padding">
      <div className="pipeline-flow-line" aria-hidden="true" />
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-accent dark:text-accent uppercase tracking-wider mb-3">
            {experienceSection.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-foreground text-foreground mb-4">
            {experienceSection.headline}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {experienceDescription}
          </p>
        </div>

        {/* Timeline */}
        <div ref={sectionRef} className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-muted md:-translate-x-px" />

          {experience.map((exp, index) => (
            <div
              key={exp.company}
              className={cn(
                'relative mb-12 last:mb-0',
                isVisible && 'animate-fade-in-up'
              )}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Timeline node */}
              <div className="absolute left-8 md:left-1/2 w-4 h-4 -translate-x-1/2 bg-card border-4 border-accent rounded-full z-10" />

              {/* Card */}
              <div
                className={cn(
                  'ml-16 md:ml-0 md:w-[calc(50%-2rem)]',
                  index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                )}
              >
                <Card className="overflow-hidden border-border transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-5 h-5 text-accent" />
                          <h3 className="text-xl font-display font-semibold text-foreground text-foreground">
                            {exp.company}
                          </h3>
                        </div>
                        <p className="text-lg font-medium text-slate-700 text-muted-foreground">
                          {exp.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mt-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {exp.period}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {exp.location}
                        </span>
                      )}
                    </div>

                    {/* Client badges */}
                    {exp.clients && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {exp.clients.map((client) => (
                          <Badge key={client} variant="accent">
                            {client}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Expand button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-slate-600 dark:text-slate-400 hover:text-foreground dark:hover:text-slate-100 mb-2"
                      onClick={() =>
                        setExpandedIndex(expandedIndex === index ? null : index)
                      }
                    >
                      <span>
                        {expandedIndex === index
                          ? 'Hide details'
                          : 'Show highlights'}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform',
                          expandedIndex === index && 'rotate-180'
                        )}
                      />
                    </Button>

                    {/* Expandable content */}
                    <div
                      className={cn(
                        'overflow-hidden transition-all duration-300',
                        expandedIndex === index
                          ? 'max-h-[1000px] opacity-100'
                          : 'max-h-0 opacity-0'
                      )}
                    >
                      {/* Highlights */}
                      <ul className="space-y-3 mb-6">
                        {exp.highlights.map((highlight, i) => (
                          <li
                            key={i}
                            className="flex gap-3 text-sm text-slate-600 dark:text-slate-400"
                          >
                            <span className="text-accent font-bold shrink-0">
                              &rarr;
                            </span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Tech stack */}
                      {exp.techStack && exp.techStack.length > 0 && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                            Technologies
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {exp.techStack.map((tech) => (
                              <Badge key={tech} variant="secondary">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
