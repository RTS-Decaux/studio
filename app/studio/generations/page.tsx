import { GenerationHistory } from "@/components/studio/generation-history";
import { StudioHeader } from "@/components/studio/studio-header";
import { getUserGenerationsAction } from "@/lib/studio/actions";

export default async function GenerationsPage() {
  const generations = await getUserGenerationsAction();

  return (
    <div className="flex h-full flex-col">
      <StudioHeader showNewButton={false} title="Generations" />

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <GenerationHistory generations={generations} />
        </div>
      </main>
    </div>
  );
}
