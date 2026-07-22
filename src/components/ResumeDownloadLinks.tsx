import { type CSSProperties } from 'react'
import { CoverLetterDialog } from '@/components/CoverLetterDialog'
import { DialogTrigger } from '@/components/ui/dialog'
import { usePdfDownload } from '@/hooks/usePdfDownload'

interface ResumeDownloadLinksProps {
  linkStyle?: CSSProperties
}

const defaultLinkStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--color-foreground)',
  textDecoration: 'none',
  padding: '16px 24px',
  border: '1px solid var(--color-border)',
  background: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 12,
}

/**
 * Plain-link-styled resume/cover-letter download triggers for layouts
 * (editorial, concrete) that build their own bespoke CSS rather than using
 * the shared shadcn Button component.
 */
export function ResumeDownloadLinks({ linkStyle }: ResumeDownloadLinksProps) {
  const { isGenerating, error, run } = usePdfDownload()
  const style = { ...defaultLinkStyle, ...linkStyle }

  const handleDownloadResume = () =>
    run(async () => {
      const { generateResumePdf } = await import(
        '@/lib/resume/generateResumePdf'
      )
      generateResumePdf()
    })

  return (
    <>
      <button
        type="button"
        style={style}
        onClick={handleDownloadResume}
        disabled={isGenerating}
      >
        {isGenerating ? 'Preparing\u2026' : 'Download R\u00e9sum\u00e9'}
      </button>

      <CoverLetterDialog>
        <DialogTrigger asChild>
          <button type="button" style={style}>
            Download Cover Letter
          </button>
        </DialogTrigger>
      </CoverLetterDialog>

      {error && (
        <p
          role="alert"
          style={{
            ...style,
            border: 'none',
            padding: '8px 0',
            color: '#b91c1c',
            cursor: 'default',
            fontSize: 12,
            display: 'block',
            width: '100%',
          }}
        >
          {error}
        </p>
      )}
    </>
  )
}
