"use client";

import type { User } from "@supabase/supabase-js";
import { Bot, MessageSquare, Plus, Search, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { SidebarHistory } from "@/components/sidebar-history";
import { TeamSwitcher } from "@/components/team-switcher";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { chatModels } from "@/lib/ai/models";

export function AppSidebar({
  user,
  ...props
}: {
  user: User | undefined;
} & React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { setOpenMobile, open, setOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = React.useState("");

  const isGuest = user?.is_anonymous === true;

  const teams = [
    {
      name: "Чат",
      logo: MessageSquare,
      plan: "Рабочая область",
      url: "/",
    },
    // Hide Studio for guest users
    ...(!isGuest ? [{
      name: "Студия",
      logo: Video,
      plan: "Рабочая область",
      url: "/studio",
    }] : []),
  ];

  const modelsNav = chatModels.map((model) => ({
    title: model.name,
    url: "#",
    description: model.description,
  }));

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Гость";
  const userEmail = user?.email || "";

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
                setOpenMobile(false);
                router.push("/");
                router.refresh();
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
              onClick={() => {
                if (!open) {
                  setOpen(true);
                }
              }}
              tooltip="Поиск чатов"
            >
              <Search className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                Поиск
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Search Input - только в expanded состоянии */}
        <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
          <Input
            className="h-8"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск чатов..."
            type="search"
            value={searchQuery}
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
          <SidebarHistory searchQuery={searchQuery} user={user} />
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
          isGuest={isGuest}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
