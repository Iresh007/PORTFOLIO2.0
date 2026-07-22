import { ArrowDown, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ClientLogos } from '@/components/ClientLogos'
import { ResumeDownloadButtons } from '@/components/ResumeDownloadButtons'
import { hero, avatarInitials } from '@/config/loader'

export function Hero() {
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-start md:items-center pt-24 md:pt-26 lg:pt-20 overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-accent/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="container-wide">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-16 items-center md:items-start lg:items-center">
          {/* Content */}
          <div className="order-last md:order-first md:flex-[1.5] space-y-6 md:space-y-4 lg:space-y-6">
            {/* Status Badge - only if configured */}
            {hero.statusBadge && (
              <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
                <span
                  className={
                    hero.statusBadge.active
                      ? 'status-dot'
                      : 'w-2 h-2 rounded-full bg-muted-foreground'
                  }
                />
                <span className="text-sm font-medium text-foreground">
                  {hero.statusBadge.text}
                </span>
              </div>
            )}

            {/* Value Pills - only if configured */}
            {hero.valuePills && hero.valuePills.length > 0 && (
              <div className="animate-fade-in-up stagger-1 flex flex-wrap gap-3">
                {hero.valuePills.map((pill) => (
                  <span
                    key={pill.sublabel}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted border border-border text-sm"
                  >
                    <span
                      className={
                        pill.highlight
                          ? 'font-bold text-accent'
                          : 'font-semibold text-foreground'
                      }
                    >
                      {pill.label}
                    </span>
                    <span className="text-muted-foreground">
                      {pill.sublabel}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="animate-fade-in-up stagger-1 headline-editorial text-foreground pipeline-cursor">
                {hero.name}
              </h1>
              <p className="animate-fade-in-up stagger-2 text-2xl md:text-3xl lg:text-4xl font-display font-medium text-accent">
                {hero.title}
              </p>
            </div>

            {/* Tagline */}
            <p className="animate-fade-in-up stagger-3 text-lg md:text-xl text-slate-600 text-muted-foreground max-w-2xl leading-relaxed">
              {hero.tagline}
            </p>

            {/* CTAs */}
            {hero.cta && (hero.cta.primary || hero.cta.secondary) && (
              <div className="animate-fade-in-up stagger-4 flex flex-wrap gap-4">
                {hero.cta.primary && (
                  <Button
                    size="lg"
                    onClick={() => handleScrollTo('experience')}
                  >
                    {hero.cta.primary}
                    <ArrowDown className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {hero.cta.secondary && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleScrollTo('contact')}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {hero.cta.secondary}
                  </Button>
                )}
              </div>
            )}

            {/* Resume & Cover Letter downloads */}
            <ResumeDownloadButtons className="animate-fade-in-up stagger-4 flex flex-wrap gap-4" />

            {/* Quick stats - only if configured */}
            {hero.quickStats && hero.quickStats.length > 0 && (
              <div className="animate-fade-in-up stagger-5 grid grid-cols-3 gap-3 pt-2">
                {hero.quickStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-border bg-card px-4 py-3 text-center"
                  >
                    <p className="text-2xl sm:text-3xl font-mono font-bold text-accent leading-none">
                      {stat.value}
                      <span className="text-muted-foreground">{stat.suffix}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Client Logos Strip */}
            <div className="animate-fade-in-up stagger-6 pt-4">
              <ClientLogos />
            </div>
          </div>

          {/* Profile Image */}
          <div className="order-first md:order-last flex justify-center md:justify-end md:flex-1">
            <div className="animate-scale-in stagger-2 relative">
              {/* Decorative elements */}
              <div className="absolute -top-3 -left-3 w-16 h-16 sm:w-20 sm:h-20 md:w-16 md:h-16 lg:w-24 lg:h-24 border-2 border-accent/20 rounded-2xl -z-10" />
              <div className="absolute -bottom-3 -right-3 w-20 h-20 sm:w-24 sm:h-24 md:w-20 md:h-20 lg:w-32 lg:h-32 bg-muted rounded-2xl -z-10" />

              {/* Avatar with animated glow border */}
              <div className="avatar-glow">
                <Avatar className="w-48 h-48 sm:w-56 sm:h-56 md:w-52 md:h-52 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-2xl shadow-xl">
                  <AvatarImage
                    src={hero.avatar}
                    alt={hero.name}
                    className="object-top"
                  />
                  <AvatarFallback className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl rounded-2xl bg-gradient-to-br from-muted to-card">
                    {avatarInitials}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Floating badge - only if configured */}
              {hero.badge && (
                <div className="absolute -bottom-6 left-0 sm:-left-4 sm:-bottom-7 md:-bottom-8 md:-left-6 lg:-left-8 bg-card rounded-xl shadow-lg px-3 py-2 sm:px-4 sm:py-3 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <span className="text-accent font-bold">
                        {hero.badge.value}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        {hero.badge.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {hero.badge.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
