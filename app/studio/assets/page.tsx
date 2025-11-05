import { AssetGallery } from "@/components/studio/asset-gallery";
import { StudioHeader } from "@/components/studio/studio-header";
import { getUserAssetsAction } from "@/lib/studio/actions";

export default async function AssetsPage() {
  const assets = await getUserAssetsAction();

  return (
    <div className="flex flex-col h-full">
      <StudioHeader title="Assets Library" showNewButton={false} />

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Asset Library
            </h1>
            <p className="text-muted-foreground">
              Manage your images, videos, and audio files
            </p>
          </div>
          <AssetGallery assets={assets} />
        </div>
      </main>
    </div>
  );
}
