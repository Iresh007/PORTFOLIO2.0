import { describe, it, expect } from 'vitest'

// jsPDF builds the PDF entirely in-memory and works fine under plain Node
// (no DOM required) — only the final .save() call touches browser download
// APIs (creating a temporary <a> and clicking it). Under this project's
// Node test environment there's no `document`, so we stub just enough of
// it for jsPDF's save() path to run without throwing. The goal of these
// tests is to catch runtime errors in the generators' own layout logic
// (e.g. a bad splitTextToSize call, an undefined field), not to validate
// jsPDF's browser download mechanics.
function withDocumentStub<T>(fn: () => T): T {
  const win = globalThis as unknown as { document?: unknown }
  const hadDocument = 'document' in win && win.document !== undefined
  if (!hadDocument) {
    win.document = {
      createElement: () => ({
        click: () => {},
        setAttribute: () => {},
        style: {},
      }),
      body: {
        appendChild: (node: unknown) => node,
        removeChild: (node: unknown) => node,
      },
    }
  }
  try {
    return fn()
  } finally {
    if (!hadDocument) {
      delete win.document
    }
  }
}

describe('generateResumePdf', () => {
  it('runs to completion without throwing', async () => {
    const { generateResumePdf } = await import('../generateResumePdf')
    expect(() => withDocumentStub(() => generateResumePdf())).not.toThrow()
  })
})

describe('generateCoverLetterPdf', () => {
  it('runs to completion without throwing for a typical company name', async () => {
    const { generateCoverLetterPdf } = await import(
      '../generateCoverLetterPdf'
    )
    expect(() =>
      withDocumentStub(() => generateCoverLetterPdf('Acme Corp'))
    ).not.toThrow()
  })

  it('handles a long company name without throwing', async () => {
    const { generateCoverLetterPdf } = await import(
      '../generateCoverLetterPdf'
    )
    expect(() =>
      withDocumentStub(() =>
        generateCoverLetterPdf(
          'A Very Long International Conglomerate Holdings Company Name Limited'
        )
      )
    ).not.toThrow()
  })

  it('handles a company name with special characters without throwing', async () => {
    const { generateCoverLetterPdf } = await import(
      '../generateCoverLetterPdf'
    )
    expect(() =>
      withDocumentStub(() => generateCoverLetterPdf('  Acme & Co. (Pvt) Ltd  '))
    ).not.toThrow()
  })
})
