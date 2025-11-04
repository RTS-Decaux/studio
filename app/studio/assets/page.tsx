import { StudioHeader } from "@/components/studio/studio-header";
import { Film } from "lucide-react";

export default function AssetsPage() {
  return (
    <div className="flex flex-col h-full">
      <StudioHeader title="Assets" showNewButton={false} />
      
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Asset Library</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Coming in Phase 3: Browse and manage all your assets across projects
          </p>
        </div>
      </main>
    </div>
  );
}
