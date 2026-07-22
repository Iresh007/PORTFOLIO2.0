import { useState, type FormEvent } from 'react'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Formspree form ID from Iresh's reference portfolio at
// https://github.com/Iresh007/Portfolio — same endpoint, same inbox.
const FORMSPREE_URL = 'https://formspree.io/f/mvgrzrzk'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function ContactForm() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    setState('submitting')
    setErrorMessage('')

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })

      if (response.ok) {
        setState('success')
        form.reset()
      } else {
        const json = (await response.json()) as {
          errors?: Array<{ message: string }>
        }
        const msg =
          json.errors?.map((e) => e.message).join(', ') ||
          'Something went wrong. Please try again or email directly.'
        setErrorMessage(msg)
        setState('error')
      }
    } catch {
      setErrorMessage(
        'Could not send your message — check your connection and try again.'
      )
      setState('error')
    }
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (state === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-3 py-8 text-center"
      >
        <CheckCircle className="h-10 w-10 text-accent" />
        <p className="text-base font-semibold text-foreground">
          Message sent!
        </p>
        <p className="text-sm text-muted-foreground">
          Thanks for reaching out — I'll get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-2 text-xs text-accent hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
      aria-label="Contact form"
    >
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="cf-name" className="text-sm font-medium text-foreground">
          Name
        </Label>
        <Input
          id="cf-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your name"
          disabled={state === 'submitting'}
          className="bg-muted border-border focus:border-accent"
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="cf-email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <Input
          id="cf-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          disabled={state === 'submitting'}
          className="bg-muted border-border focus:border-accent"
        />
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="cf-message" className="text-sm font-medium text-foreground">
          Message
        </Label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={4}
          placeholder="What would you like to discuss?"
          disabled={state === 'submitting'}
          className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent disabled:opacity-50 resize-none transition-colors"
        />
      </div>

      {/* Honeypot — hidden, catches bots */}
      <input
        type="text"
        name="_gotcha"
        aria-hidden="true"
        tabIndex={-1}
        className="hidden"
        readOnly
        value=""
      />

      {/* Error message */}
      {state === 'error' && errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={state === 'submitting'}
      >
        {state === 'submitting' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Or email directly at{' '}
        <a
          href="mailto:iresh.agrawal23@gmail.com"
          className="text-accent hover:underline"
        >
          iresh.agrawal23@gmail.com
        </a>
      </p>
    </form>
  )
}
