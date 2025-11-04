"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { User } from "@supabase/supabase-js";
import * as React from "react";

export function ChatLayoutWrapper({
  user,
  children,
}: {
  user: User | undefined;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} variant="inset" collapsible="icon" />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
