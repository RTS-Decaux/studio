"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { useWindowSize } from "usehooks-ts";
import { PlusIcon } from "@/components/icons";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

interface StudioHeaderProps {
  title?: string;
  showNewButton?: boolean;
}

function PureStudioHeader({
  title = "Projects",
  showNewButton = true,
}: StudioHeaderProps) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-border/40 border-b bg-background/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-4">
      <SidebarToggle />

      {/* Title with icon */}
      <div className="flex items-center gap-2">
        <div className="hidden items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-1.5 sm:flex">
          <Sparkles className="h-4 w-4 text-purple-600" strokeWidth={2} />
        </div>
        <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-bold text-lg text-transparent tracking-tight md:text-xl">
          {title}
        </h1>
      </div>

      {/* New Project Button */}
      {showNewButton && (!open || windowWidth < 768) && (
        <Button
          className="ml-auto h-9 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 shadow-sm hover:from-purple-700 hover:to-pink-700"
          onClick={() => {
            router.push("/studio/new");
          }}
          size="sm"
        >
          <PlusIcon />
          <span className="hidden sm:inline">New Project</span>
        </Button>
      )}
    </header>
  );
}

export const StudioHeader = memo(PureStudioHeader, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.showNewButton === nextProps.showNewButton
  );
});
