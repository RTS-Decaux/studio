"use client";

import { ChevronsUpDown, LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { toast } from "@/components/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSupabaseSession } from "@/lib/supabase/provider";

export function NavUser({
  user,
  isGuest = false,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  isGuest?: boolean;
}) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { supabase } = useSupabaseSession();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        toast({
          type: "error",
          description: "Failed to sign out. Please try again.",
        });
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Unexpected sign out error:", error);
      toast({
        type: "error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
              tooltip={user.name}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage alt={user.name} src={user.avatar} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage alt={user.name} src={user.avatar} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isGuest ? (
              <DropdownMenuItem asChild>
                <a href="/register?fromGuest=true">
                  <LogIn />
                  Войти в аккаунт
                </a>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer text-red-500 focus:text-red-600"
                onClick={handleSignOut}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
