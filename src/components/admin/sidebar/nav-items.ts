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
  ListOrdered,
  FileText,
  Menu,
  MessageSquareQuote,
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

export function getNavGroups(orgSlug: string, t: any): NavGroup[] {
  const base = `/admin/${orgSlug}`

  return [
    {
      label: t('groupGeneral'),
      items: [
        { title: t('dashboard'), href: base, icon: LayoutDashboard },
      ],
    },
    {
      label: t('groupSports'),
      items: [
        { title: t('matches'), href: `${base}/sports/matches`, icon: Trophy },
        { title: t('standings'), href: `${base}/sports/standings`, icon: ListOrdered },
        { title: t('players'), href: `${base}/sports/players`, icon: Users },
        { title: t('teams'), href: `${base}/sports/teams`, icon: ShieldHalf },
        { title: t('seasons'), href: `${base}/sports/seasons`, icon: CalendarDays },
      ],
    },
    {
      label: t('groupWebsite'),
      items: [
        { title: t('pages'), href: `${base}/site/pages`, icon: FileText },
        { title: t('menu'), href: `${base}/site/menu`, icon: Menu },
        { title: t('testimonials'), href: `${base}/site/testimonials`, icon: MessageSquareQuote },
      ],
    },
    {
      label: t('groupEditorial'),
      items: [
        { title: t('articles'), href: `${base}/editorial/articles`, icon: Newspaper },
        { title: t('events'), href: `${base}/editorial/events`, icon: CalendarRange },
        { title: t('categories'), href: `${base}/editorial/categories`, icon: FolderOpen },
        { title: t('tags'), href: `${base}/editorial/tags`, icon: Tags },
      ],
    },
    {
      label: t('groupMedia'),
      items: [
        { title: t('library'), href: `${base}/media`, icon: Image },
      ],
    },
    {
      label: t('groupManagement'),
      items: [
        { title: t('users'), href: `${base}/users`, icon: UserCog },
        { title: t('configuration'), href: `${base}/configuration`, icon: Settings },
      ],
    },
  ]
}
