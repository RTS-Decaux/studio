import { StudioHeader } from "@/components/studio/studio-header";
import { Layout } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="flex flex-col h-full">
      <StudioHeader title="Templates" showNewButton={false} />
      
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Template Gallery</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Coming in Phase 6: Browse and use pre-made templates for quick generation
          </p>
        </div>
      </main>
    </div>
  );
}
