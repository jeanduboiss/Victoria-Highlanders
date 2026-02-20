'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ChevronsUpDown, Settings, LogOut, User } from 'lucide-react'
import { getNavGroups } from './nav-items'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  LEAGUE_ADMIN: 'Liga Admin',
  CLUB_ADMIN: 'Club Admin',
  CLUB_MANAGER: 'Manager',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
}

interface AdminSidebarProps {
  orgSlug: string
  orgName: string
  userEmail: string
  userRole: string
}

export function AdminSidebar({ orgSlug, orgName, userEmail, userRole }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navGroups = getNavGroups(orgSlug)

  const initials = userEmail.slice(0, 2).toUpperCase()

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Sidebar className="border-r-0 border-r-transparent" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-2.5 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent hover:bg-sidebar-accent transition-colors"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-black">
                    <Image src="/images/logo-victoria-sm.png" alt="VHFC" width={24} height={27} className="object-contain" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5 leading-none min-w-0">
                    <span className="font-semibold truncate text-sm">{orgName}</span>
                    <span className="text-[11px] text-sidebar-foreground/50">Panel de control</span>
                  </div>
                  <ChevronsUpDown className="size-3.5 text-sidebar-foreground/40 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/${orgSlug}/configuration`}>
                    <Settings className="size-4" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2.5 mt-3 space-y-3">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="p-0">
            <SidebarGroupLabel className="text-[10px] uppercase font-bold tracking-wider text-sidebar-foreground/40 h-5 px-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-0.5 mt-1">
              {group.items.map((item) => {
                const isActive =
                  item.href === `/admin/${orgSlug}`
                    ? pathname === item.href
                    : pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-7 rounded-md transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground text-[13px] font-medium"
                    >
                      <Link href={item.href}>
                        <item.icon className="size-[15px]" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-2.5 pb-3 border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2.5 py-2.5 px-1">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[12px] font-medium text-sidebar-foreground/80 truncate">{userEmail}</span>
            <Badge variant="secondary" className="w-fit text-[10px] px-1.5 h-4 mt-0.5 bg-sidebar-accent text-sidebar-foreground/60 border-0 hover:bg-sidebar-accent">
              {ROLE_LABELS[userRole] ?? userRole}
            </Badge>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
