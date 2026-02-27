import { Globe, Star, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function GoogleReviewsPlaceholder() {
  return (
    <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
          <Globe className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold">Google Reviews</h3>
            <Badge variant="secondary" className="text-[10px]">Próximamente</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Importa reseñas directamente desde Google My Business. Las reseñas importadas se sincronizan automáticamente y pueden publicarse o ocultarse desde este panel.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {[
              'Sincronización automática',
              'Filtrar por rating',
              'Publicar/ocultar individualmente',
              'Responder desde el panel',
            ].map((f) => (
              <div key={f} className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                {f}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground/60">
            <ArrowRight className="w-3 h-3" />
            Requiere Google My Business API Key
          </div>
        </div>
      </div>
    </div>
  )
}
