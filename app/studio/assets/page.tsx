import { AssetGallery } from "@/components/studio/asset-gallery";
import { StudioHeader } from "@/components/studio/studio-header";
import { getUserAssetsAction } from "@/lib/studio/actions";

export default async function AssetsPage() {
  const assets = await getUserAssetsAction();

  return (
    <div className="flex h-full flex-col">
      <StudioHeader showNewButton={false} title="Библиотека ресурсов" />

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-bold text-3xl text-transparent">
              Библиотека ресурсов
            </h1>
            <p className="text-muted-foreground">
              Управление изображениями, видео и аудио файлами
            </p>
          </div>
          <AssetGallery assets={assets} />
        </div>
      </main>
    </div>
  );
}
