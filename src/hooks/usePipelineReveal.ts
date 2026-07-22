import { useEffect, useRef } from 'react'

interface UsePipelineRevealOptions {
  rootMargin?: string
  once?: boolean
}

/**
 * Attaches Pipeline design system scroll-reveal behaviour to a section.
 * When the element enters the viewport:
 *   - sets [data-pipeline-active] → triggers the CSS flow-line sweep
 *   - adds .pipeline-reveal--visible to .pipeline-reveal children → fade-up
 *
 * Safe on all design systems — CSS only acts when
 * [data-design-system='pipeline'] is on the root element.
 * Respects prefers-reduced-motion via CSS (transitions set to none).
 */
export function usePipelineReveal(options: UsePipelineRevealOptions = {}) {
  const { rootMargin = '-10% 0px -10% 0px', once = true } = options
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const activate = () => {
      el.setAttribute('data-pipeline-active', '')
      el.querySelectorAll<HTMLElement>('.pipeline-reveal').forEach((child) => {
        child.classList.add('pipeline-reveal--visible')
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activate()
            if (once) observer.disconnect()
          } else if (!once) {
            el.removeAttribute('data-pipeline-active')
            el.querySelectorAll<HTMLElement>('.pipeline-reveal').forEach(
              (child) => child.classList.remove('pipeline-reveal--visible')
            )
          }
        })
      },
      { rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, once])

  return ref
}
