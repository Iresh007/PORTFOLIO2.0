import { Download, FileText, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import { CoverLetterDialog } from '@/components/CoverLetterDialog'
import { usePdfDownload } from '@/hooks/usePdfDownload'

interface ResumeDownloadButtonsProps {
  className?: string
  size?: 'default' | 'sm' | 'lg'
  variant?: 'outline' | 'accent' | 'default'
  buttonClassName?: string
}

export function ResumeDownloadButtons({
  className,
  size = 'lg',
  variant = 'outline',
  buttonClassName,
}: ResumeDownloadButtonsProps) {
  const { isGenerating, error, run } = usePdfDownload()

  const handleDownloadResume = () =>
    run(async () => {
      // Dynamically imported so jsPDF (and its dependencies) only load when
      // someone actually clicks download, keeping the initial page light.
      const { generateResumePdf } = await import(
        '@/lib/resume/generateResumePdf'
      )
      generateResumePdf()
    })

  return (
    <div>
      <div className={className}>
        <Button
          variant={variant}
          size={size}
          className={buttonClassName}
          onClick={handleDownloadResume}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download Resume
        </Button>

        <CoverLetterDialog>
          <DialogTrigger asChild>
            <Button variant={variant} size={size} className={buttonClassName}>
              <FileText className="mr-2 h-4 w-4" />
              Download Cover Letter
            </Button>
          </DialogTrigger>
        </CoverLetterDialog>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-sm text-destructive"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
