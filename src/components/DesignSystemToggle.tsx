import { Grid3X3, PenTool, Gauge, Shapes, BookText, Square, Database } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import {
  DESIGN_SYSTEMS,
  DEFAULT_DESIGN_SYSTEM,
} from '@/hooks/designSystemConfig'
import type { DesignSystem } from '@/hooks/designSystemConfig'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const DESIGN_SYSTEM_ICONS: Record<DesignSystem, LucideIcon> = {
  corporate: Grid3X3,
  'hand-drawn': PenTool,
  automotive: Gauge,
  bauhaus: Shapes,
  editorial: BookText,
  concrete: Square,
  pipeline: Database,
}

export function DesignSystemToggle() {
  const { designSystem, setDesignSystem } = useDesignSystem()

  const currentIndex = DESIGN_SYSTEMS.indexOf(designSystem)
  const nextIndex =
    currentIndex === -1 ? 0 : (currentIndex + 1) % DESIGN_SYSTEMS.length
  const nextDesignSystem = DESIGN_SYSTEMS[nextIndex]

  const toggle = () => {
    if (currentIndex === -1) {
      console.warn(
        `Invalid design system: "${designSystem}". Resetting to default.`
      )
      setDesignSystem(DEFAULT_DESIGN_SYSTEM)
      return
    }
    setDesignSystem(nextDesignSystem)
  }

  const Icon = DESIGN_SYSTEM_ICONS[designSystem] ?? Grid3X3
  const label = `Switch to ${nextDesignSystem} style`

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={label}
            className="relative overflow-hidden"
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
