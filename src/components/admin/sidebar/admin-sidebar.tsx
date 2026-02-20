'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getNavGroups } from './nav-items'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

interface AdminSidebarProps {
  orgSlug: string
  orgName: string
}

export function AdminSidebar({ orgSlug, orgName }: AdminSidebarProps) {
  const pathname = usePathname()
  const navGroups = getNavGroups(orgSlug)

  return (
    <Sidebar className="border-r-0 border-r-transparent bg-zinc-950 text-zinc-100" collapsible="icon">
      <SidebarHeader className="border-b border-white/10 mx-2 py-3 px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[state=open]:bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Link href={`/admin/${orgSlug}`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#FF7A59] text-white font-bold text-sm">
                  {orgName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold truncate">{orgName}</span>
                  <span className="text-xs text-white/50">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 mt-4 space-y-4">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="p-0">
            <SidebarGroupLabel className="text-[10px] uppercase font-bold tracking-wider text-white/40 h-6">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1 mt-1">
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
                      className="h-8 rounded-md transition-colors text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white font-medium"
                    >
                      <Link href={item.href}>
                        <item.icon className="size-[18px] opacity-70" />
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

      <SidebarRail />
    </Sidebar>
  )
}
