import {
  LayoutDashboard,
  Users,
  ShieldHalf,
  CalendarDays,
  Trophy,
  Newspaper,
  CalendarRange,
  Tags,
  FolderOpen,
  Image,
  Settings,
  UserCog,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export function getNavGroups(orgSlug: string): NavGroup[] {
  const base = `/admin/${orgSlug}`

  return [
    {
      label: 'General',
      items: [
        { title: 'Dashboard', href: base, icon: LayoutDashboard },
      ],
    },
    {
      label: 'Deportes',
      items: [
        { title: 'Partidos', href: `${base}/sports/matches`, icon: Trophy },
        { title: 'Jugadores', href: `${base}/sports/players`, icon: Users },
        { title: 'Equipos', href: `${base}/sports/teams`, icon: ShieldHalf },
        { title: 'Temporadas', href: `${base}/sports/seasons`, icon: CalendarDays },
      ],
    },
    {
      label: 'Editorial',
      items: [
        { title: 'Artículos', href: `${base}/editorial/articles`, icon: Newspaper },
        { title: 'Eventos', href: `${base}/editorial/events`, icon: CalendarRange },
        { title: 'Categorías', href: `${base}/editorial/categories`, icon: FolderOpen },
        { title: 'Tags', href: `${base}/editorial/tags`, icon: Tags },
      ],
    },
    {
      label: 'Media',
      items: [
        { title: 'Biblioteca', href: `${base}/media`, icon: Image },
      ],
    },
    {
      label: 'Gestión',
      items: [
        { title: 'Usuarios', href: `${base}/users`, icon: UserCog },
        { title: 'Configuración', href: `${base}/configuration`, icon: Settings },
      ],
    },
  ]
}
