"use client";

import { StudioSidebar } from "@/components/studio/studio-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { User } from "@supabase/supabase-js";
import * as React from "react";

export function StudioLayoutWrapper({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <StudioSidebar user={user} variant="inset" collapsible="icon" />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
