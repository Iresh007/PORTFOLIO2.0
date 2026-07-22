import { useEffect, useRef, useState } from 'react'
import { Lock, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DesignSystem } from '@/hooks/designSystemConfig'
import { DEFAULT_DESIGN_SYSTEM } from '@/hooks/designSystemConfig'

interface LockDesignDefaultProps {
  designSystem: DesignSystem
}

/**
 * Owner-only "lock as site default" control.
 *
 * This is a static site with no backend, so there is no way for a button
 * click to durably change what every future visitor sees — that requires
 * editing src/config/design-systems.json and redeploying. This control is
 * honest about that: it shows the exact one-line change to make and lets
 * the owner copy it, rather than pretending a click alone makes it
 * permanent for everyone.
 */
export function LockDesignDefault({ designSystem }: LockDesignDefaultProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isAlreadyDefault = designSystem === DEFAULT_DESIGN_SYSTEM

  const snippet = `"defaultSystem": "${designSystem}"`

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — the snippet is
      // still visible on screen for manual copy.
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-accent/40 bg-accent/5 p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-accent">
        <Lock className="h-3.5 w-3.5" />
        Owner: Lock site-wide default
      </div>

      {isAlreadyDefault ? (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-accent" />
          "{designSystem}" is already the default every visitor sees.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            To make <span className="font-medium text-card-foreground">{designSystem}</span> the
            design every visitor sees by default, update{' '}
            <code className="px-1 py-0.5 rounded bg-muted text-[11px]">
              src/config/design-systems.json
            </code>{' '}
            and redeploy:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-2 py-1.5 rounded bg-muted text-[11px] font-mono overflow-x-auto whitespace-nowrap">
              {snippet}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0 h-7 px-2"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
