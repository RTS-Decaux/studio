import { StudioHeader } from "@/components/studio/studio-header";
import { Sparkles } from "lucide-react";

export default function GenerationsPage() {
  return (
    <div className="flex flex-col h-full">
      <StudioHeader title="Generations" showNewButton={false} />
      
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Generation History</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Coming in Phase 5: View all your generations across all projects
          </p>
        </div>
      </main>
    </div>
  );
}
