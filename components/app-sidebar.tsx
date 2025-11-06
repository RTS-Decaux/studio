"use client"

import {
  Bot,
  MessageSquare,
  Plus,
  Search,
  Video,
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { SidebarHistory } from "@/components/sidebar-history"
import { TeamSwitcher } from "@/components/team-switcher"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter, SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"
import { chatModels } from "@/lib/ai/models"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export function AppSidebar({ 
  user,
  ...props 
}: { 
  user: User | undefined;
} & React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { setOpenMobile, open, setOpen } = useSidebar()
  const [searchQuery, setSearchQuery] = React.useState("")

  const teams = [
    {
      name: "Чат",
      logo: MessageSquare,
      plan: "Рабочая область",
      url: "/",
    },
    {
      name: "Студия",
      logo: Video,
      plan: "Рабочая область",
      url: "/studio",
    },
  ]

  const modelsNav = chatModels.map((model) => ({
    title: model.name,
    url: "#",
    description: model.description,
  }))

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Гость"
  const userEmail = user?.email || ""

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* Team Switcher - скрыть в collapsed состоянии */}
        <div className="group-data-[collapsible=icon]:hidden">
          <TeamSwitcher teams={teams} />
        </div>

        {/* New Chat - всегда видна с tooltip в collapsed */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                setOpenMobile(false)
                router.push("/")
                router.refresh()
              }}
              tooltip="Новый чат"
            >
              <Plus className="h-4 w-4" />
              <span>Новый чат</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Search - иконка всегда видна, при клике открывает sidebar */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Поиск чатов"
              onClick={() => {
                if (!open) {
                  setOpen(true)
                }
              }}
            >
              <Search className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Поиск</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Search Input - только в expanded состоянии */}
        <div className="group-data-[collapsible=icon]:hidden px-2 pb-2">
          <Input
            type="search"
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* NavMain уже имеет group-data-[collapsible=icon]:hidden */}
        <NavMain 
          items={[
            {
              title: "Модели ИИ",
              url: "#",
              icon: Bot,
              isActive: false,
              items: modelsNav,
            },
          ]} 
        />
        
        {/* SidebarHistory - скрыть в collapsed состоянии */}
        <div className="group-data-[collapsible=icon]:hidden">
          <SidebarHistory user={user} searchQuery={searchQuery} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        {/* NavUser - скрыть детали в collapsed, показать только аватар */}
        <NavUser 
          user={{
            name: userName,
            email: userEmail,
            avatar: user?.user_metadata?.avatar_url || "/avatars/default.jpg",
          }} 
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
