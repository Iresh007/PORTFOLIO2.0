import { useState, useRef, useEffect } from 'react'
import { Mail, Linkedin, MapPin, Copy, Check, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ResumeDownloadButtons } from '@/components/ResumeDownloadButtons'
import { ContactForm } from '@/components/ContactForm'
import { contact, footer } from '@/config/loader'
import { cn } from '@/lib/utils'
import { usePipelineReveal } from '@/hooks/usePipelineReveal'

export function Contact() {
  const pipelineRef = usePipelineReveal()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup the copy-feedback timer on unmount (SEC-005 timer leak fix)
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <section id="contact" ref={pipelineRef} className="relative overflow-hidden section-padding">
      <div className="pipeline-flow-line" aria-hidden="true" />
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-accent dark:text-accent uppercase tracking-wider mb-3">
            {contact.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-foreground mb-4">
            {contact.headline}
          </h2>
          <p className="text-lg text-muted-foreground">
            {contact.description}
          </p>
        </div>

        {/* Contact Card */}
        <div ref={sectionRef} className="max-w-2xl mx-auto">
          <Card
            className={cn(
              'border-border overflow-hidden',
              isVisible && 'animate-fade-in-up'
            )}
          >
            <CardContent className="p-0">
              {/* Contact details */}
              <div className="p-8 space-y-6">
                {/* Email */}
                <button
                  onClick={() => copyToClipboard(contact.email, 'email')}
                  className="w-full group flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-base font-medium text-foreground">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-muted-foreground group-hover:text-accent transition-colors">
                    {copiedField === 'email' ? (
                      <Check className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* LinkedIn */}
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full group flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                      <Linkedin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        LinkedIn
                      </p>
                      <p className="text-base font-medium text-foreground">
                        {contact.linkedin}
                      </p>
                    </div>
                  </div>
                  <div className="text-muted-foreground group-hover:text-accent transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </a>

                {/* Location - only if configured */}
                {contact.location && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-muted">
                    <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Location
                      </p>
                      <p className="text-base font-medium text-foreground">
                        {contact.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Section */}
              <div className="p-8 border-t border-border">
                <p className="text-center text-muted-foreground mb-6">
                  {contact.ctaText}
                </p>
                <ResumeDownloadButtons
                  className="flex flex-wrap justify-center gap-3 mb-8"
                />

                {/* Formspree contact form */}
                <div className="max-w-md mx-auto">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 text-center">
                    Send a Message
                  </h3>
                  <ContactForm />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>{footer.copyrightText}</p>
          </div>
        </footer>
      </div>
    </section>
  )
}
