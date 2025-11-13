"use client";

import type { User } from "@supabase/supabase-js";
import {
  Film,
  FolderOpen,
  Layout,
  MessageSquare,
  Plus,
  Sparkles,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type * as React from "react";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

export function StudioSidebar({
  user,
  ...props
}: {
  user: User | undefined;
} & React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const teams = [
    {
      name: "Chat",
      logo: MessageSquare,
      plan: "Workspace",
      url: "/",
    },
    {
      name: "Studio",
      logo: Video,
      plan: "Workspace",
      url: "/studio",
    },
  ];

  const navigation = [
    {
      name: "Projects",
      href: "/studio",
      icon: FolderOpen,
      exact: true,
    },
    {
      name: "Templates",
      href: "/studio/templates",
      icon: Layout,
    },
    {
      name: "Generations",
      href: "/studio/generations",
      icon: Sparkles,
    },
    {
      name: "Assets",
      href: "/studio/assets",
      icon: Film,
    },
  ];

  const quickActions = [
    {
      name: "Generate Image",
      onClick: () => {
        setOpenMobile(false);
        router.push("/studio/new?type=text-to-image");
      },
      icon: Sparkles,
    },
    {
      name: "Generate Video",
      onClick: () => {
        setOpenMobile(false);
        router.push("/studio/new?type=text-to-video");
      },
      icon: Film,
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest";
  const userEmail = user?.email || "";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                setOpenMobile(false);
                router.push("/studio/new");
              }}
              tooltip="New Project"
            >
              <Plus className="h-4 w-4" />
              <span>New project</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href, item.exact)}
                    tooltip={item.name}
                  >
                    <Link href={item.href} onClick={() => setOpenMobile(false)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((action) => (
                <SidebarMenuItem key={action.name}>
                  <SidebarMenuButton
                    onClick={action.onClick}
                    tooltip={action.name}
                  >
                    <action.icon className="h-4 w-4" />
                    <span>{action.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          isGuest={user?.is_anonymous === true}
          user={{
            name: userName,
            email: userEmail,
            avatar: user?.user_metadata?.avatar_url || "/avatars/default.jpg",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
