import { useState, type FormEvent } from 'react'
import { FileText, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { usePdfDownload } from '@/hooks/usePdfDownload'

const COMPANY_NAME_MAX_LENGTH = 100

interface CoverLetterDialogProps {
  children: React.ReactNode
}

export function CoverLetterDialog({ children }: CoverLetterDialogProps) {
  const [open, setOpen] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [validationError, setValidationError] = useState('')
  const { isGenerating, error: generationError, run, clearError } =
    usePdfDownload()

  const resetForm = () => {
    setCompanyName('')
    setValidationError('')
    clearError()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = companyName.trim()
    if (!trimmed) {
      setValidationError('Please enter a company name to continue.')
      return
    }
    setValidationError('')

    let succeeded = false
    await run(async () => {
      // Dynamically imported so jsPDF only loads when someone actually
      // submits the form, keeping the initial page load light.
      const { generateCoverLetterPdf } = await import(
        '@/lib/resume/generateCoverLetterPdf'
      )
      generateCoverLetterPdf(trimmed)
      succeeded = true
    })

    // Only close and reset on success — if generation threw, `run` already
    // captured the error, so the dialog stays open with it visible instead
    // of closing on failure and losing the user's typed company name.
    if (succeeded) {
      setOpen(false)
      resetForm()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          resetForm()
        }
      }}
    >
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Cover Letter
          </DialogTitle>
          <DialogDescription>
            Which company are you applying to? The cover letter will be
            customized with their name before downloading.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company name</Label>
            <Input
              id="company-name"
              autoFocus
              maxLength={COMPANY_NAME_MAX_LENGTH}
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value)
                if (validationError) setValidationError('')
              }}
            />
            {validationError && (
              <p role="alert" className="text-sm text-destructive">
                {validationError}
              </p>
            )}
            {generationError && (
              <p
                role="alert"
                className="flex items-center gap-1.5 text-sm text-destructive"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {generationError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Download Cover Letter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
