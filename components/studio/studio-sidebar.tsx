"use client";

import type { User } from "@supabase/supabase-js";
import {
  ChevronRight,
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
import * as React from "react";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export function StudioSidebar({
  user,
  ...props
}: {
  user: User;
} & React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [activeWorkspace, setActiveWorkspace] = React.useState({
    name: "Studio",
    type: "studio" as "chat" | "studio",
  });

  const workspaces = [
    { name: "Chat", type: "chat" as const, icon: MessageSquare },
    { name: "Studio", type: "studio" as const, icon: Video },
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

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <SidebarTrigger />
          <span className="font-semibold">Menu</span>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  size="lg"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    {activeWorkspace.type === "chat" ? (
                      <MessageSquare className="size-4" />
                    ) : (
                      <Video className="size-4" />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {activeWorkspace.name}
                    </span>
                    <span className="truncate text-xs">Workspace</span>
                  </div>
                  <ChevronRight className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                sideOffset={4}
              >
                {workspaces.map((workspace) => (
                  <DropdownMenuItem
                    className="gap-2 p-2"
                    key={workspace.type}
                    onClick={() => {
                      setActiveWorkspace(workspace);
                      setOpenMobile(false);
                      if (workspace.type === "studio") {
                        router.push("/studio");
                      } else {
                        router.push("/");
                      }
                    }}
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <workspace.icon className="size-4" />
                    </div>
                    {workspace.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
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

        <SidebarGroup>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarUserNav user={user} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
