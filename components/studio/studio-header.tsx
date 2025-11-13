"use client";

import { PlusIcon } from "@/components/icons";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { useWindowSize } from "usehooks-ts";

type StudioHeaderProps = {
  title?: string;
  showNewButton?: boolean;
};

function PureStudioHeader({
  title = "Projects",
  showNewButton = true,
}: StudioHeaderProps) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-border/40 border-b bg-background/95 px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-3">
      <SidebarToggle />

      {/* Title with icon */}
      <div className="flex items-center gap-1.5">
        <div className="hidden items-center justify-center rounded-md bg-muted p-1 sm:flex">
          <Sparkles
            className="h-3.5 w-3.5 text-foreground/60"
            strokeWidth={2}
          />
        </div>
        <h1 className="font-semibold text-foreground text-sm tracking-tight md:text-base">
          {title}
        </h1>
      </div>

      {/* New Project Button */}
      {showNewButton && (!open || windowWidth < 768) && (
        <Button
          className="ml-auto h-7 gap-1.5"
          onClick={() => {
            router.push("/studio/new");
          }}
          size="sm"
          variant="default"
        >
          <PlusIcon />
          <span className="hidden text-xs sm:inline">New Project</span>
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
