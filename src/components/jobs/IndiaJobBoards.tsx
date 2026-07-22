import { ExternalLink } from 'lucide-react'

interface IndiaJobBoard {
  name: string
  url: string
  description: string
}

const INDIA_JOB_BOARDS: IndiaJobBoard[] = [
  {
    name: 'Naukri.com',
    url: 'https://www.naukri.com/data-engineer-jobs',
    description: "India's largest job board",
  },
  {
    name: 'LinkedIn Jobs (India)',
    url: 'https://www.linkedin.com/jobs/data-engineer-jobs-india/',
    description: 'Professional network listings',
  },
  {
    name: 'Instahyre',
    url: 'https://www.instahyre.com/search-jobs/?q=data%20engineer',
    description: 'Curated tech roles',
  },
  {
    name: 'Cutshort',
    url: 'https://cutshort.io/jobs?skill=Data+Engineering',
    description: 'Startup & product company roles',
  },
  {
    name: 'Hirist',
    url: 'https://www.hirist.tech/search?q=data+engineer',
    description: 'Tech-focused job board',
  },
  {
    name: 'AngelList / Wellfound (India)',
    url: 'https://wellfound.com/role/data-engineer',
    description: 'Startup jobs',
  },
]

export function IndiaJobBoards() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 mb-6">
      <h2 className="text-sm font-semibold text-foreground mb-1">
        India Job Boards
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        The live feed below pulls from global/remote sources. For India-specific
        listings, these boards are a better starting point.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {INDIA_JOB_BOARDS.map((board) => (
          <a
            key={board.name}
            href={board.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs hover:border-accent hover:bg-accent/5 transition-colors"
          >
            <span className="min-w-0">
              <span className="block font-medium text-foreground truncate">
                {board.name}
              </span>
              <span className="block text-muted-foreground truncate">
                {board.description}
              </span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-accent transition-colors" />
          </a>
        ))}
      </div>
    </div>
  )
}
