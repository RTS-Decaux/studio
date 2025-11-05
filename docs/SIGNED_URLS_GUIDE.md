# Signed URLs и приватный Storage - Руководство

## Обзор

Система использует **приватный** Supabase Storage bucket с генерацией **signed URLs** для безопасного доступа к файлам. Это обеспечивает:

- 🔒 **Безопасность**: Файлы доступны только авторизованным пользователям
- ⏰ **Временный доступ**: URLs автоматически истекают через 1 час
- 🎨 **Оптимизация**: Автоматические трансформации изображений
- 🔄 **Авто-обновление**: URLs обновляются до истечения срока

## Архитектура

### Bucket Configuration

**Bucket**: `studio-assets` (приватный)
- ✅ Public: `false` 
- ✅ File size limit: 100MB
- ✅ Allowed MIME types: `image/*`, `video/*`, `audio/*`

### URL Format

Внутреннее хранение использует специальный формат:
```typescript
// В базе данных
url: "supabase://storage/studio-assets/user-id/images/timestamp-file.jpg"

// При отображении генерируется signed URL
signedUrl: "https://xxx.supabase.co/storage/v1/object/sign/studio-assets/...?token=xxx"
```

### RLS Policies

Автоматически применяются при миграции `20251105000001_create_studio_assets_bucket.sql`:

1. **Upload**: Пользователи могут загружать только в свою папку `{userId}/`
2. **Read**: Пользователи видят только свои файлы
3. **Update/Delete**: Пользователи управляют только своими файлами

## API

### Server-side (lib/studio/signed-urls.ts)

#### getSignedStorageUrl()
```typescript
import { getSignedStorageUrl } from "@/lib/studio/signed-urls";

// Базовое использование
const url = await getSignedStorageUrl(asset.url);

// С трансформацией
const thumbnail = await getSignedStorageUrl(asset.url, {
  expiresIn: 3600, // 1 час
  transform: {
    width: 200,
    height: 200,
    resize: "cover",
    quality: 75,
    format: "webp",
  },
});

// Для скачивания с именем файла
const downloadUrl = await getSignedStorageUrl(asset.url, {
  expiresIn: 300, // 5 минут
  download: "my-file.jpg",
});
```

#### SignedUrlPresets
```typescript
import { SignedUrlPresets } from "@/lib/studio/signed-urls";

// Готовые пресеты
const small = await SignedUrlPresets.thumbnailSmall(url);
const medium = await SignedUrlPresets.thumbnailMedium(url);
const large = await SignedUrlPresets.previewLarge(url);
const full = await SignedUrlPresets.fullOptimized(url);
const download = await SignedUrlPresets.download(url, "filename.jpg");
```

#### getAssetSignedUrl()
```typescript
import { getAssetSignedUrl } from "@/lib/studio/signed-urls";

// Умный выбор URL в зависимости от типа и размера
const url = await getAssetSignedUrl(asset, "medium");
// Для images: трансформирует главный URL
// Для videos: использует thumbnailUrl если есть
```

#### enrichAssetsWithSignedUrls()
```typescript
import { enrichAssetsWithSignedUrls } from "@/lib/studio/signed-urls";

// Batch processing для SSR
const enrichedAssets = await enrichAssetsWithSignedUrls(assets, {
  expiresIn: 7200,
  transform: { width: 400, quality: 80 },
});

// Каждый asset теперь имеет signedUrl и signedThumbnailUrl
```

### Client-side (hooks/use-signed-url.ts)

#### useSignedUrl()
```typescript
import { useSignedUrl } from "@/hooks/use-signed-url";

function MyComponent({ asset }) {
  const { signedUrl, loading, error } = useSignedUrl(asset.url, {
    transform: {
      width: 400,
      height: 300,
      resize: "cover",
      quality: 80,
      format: "webp",
    },
  });

  if (loading) return <Spinner />;
  if (error) return <Error />;
  
  return <img src={signedUrl} alt="Asset" />;
}
```

#### useAssetSignedUrl()
```typescript
import { useAssetSignedUrl } from "@/hooks/use-signed-url";

function AssetCard({ asset }) {
  // Автоматически выбирает правильный URL и трансформацию
  const { signedUrl, loading } = useAssetSignedUrl(asset, "small");

  return (
    <div>
      {loading ? (
        <Spinner />
      ) : (
        <img src={signedUrl} alt={asset.name} />
      )}
    </div>
  );
}
```

#### useSignedUrls()
```typescript
import { useSignedUrls } from "@/hooks/use-signed-url";

function Gallery({ assets }) {
  const urls = assets.map(a => a.url);
  const { signedUrls, loading } = useSignedUrls(urls);

  return assets.map((asset, i) => (
    <img key={asset.id} src={signedUrls[i]} />
  ));
}
```

### API Endpoint

#### POST /api/studio/assets/signed-url
```typescript
// Одиночный URL
const response = await fetch("/api/studio/assets/signed-url", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "supabase://storage/studio-assets/...",
    transform: { width: 400, quality: 80 },
    expiresIn: 3600,
  }),
});
const { signedUrl } = await response.json();

// Множественные URLs
const response = await fetch("/api/studio/assets/signed-url", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    urls: ["supabase://storage/...", "supabase://storage/..."],
    transform: { width: 200 },
  }),
});
const { signedUrls } = await response.json();
```

## Использование в компонентах

### AssetGallery (Grid View)
```tsx
function AssetCard({ asset }) {
  const { signedUrl, loading } = useAssetSignedUrl(asset, "small");

  return (
    <Card>
      {loading ? (
        <Spinner />
      ) : (
        <img src={signedUrl} alt={asset.name} loading="lazy" />
      )}
    </Card>
  );
}
```

### AssetDetailDialog
```tsx
function AssetDetail({ asset }) {
  const { signedUrl: largePreview } = useAssetSignedUrl(asset, "large");
  const { signedUrl: videoUrl } = useSignedUrl(asset.url);

  if (asset.type === "image") {
    return <img src={largePreview} />;
  }

  if (asset.type === "video") {
    return <video src={videoUrl} controls />;
  }
}
```

## Upload Flow

### 1. Клиент загружает файл
```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("type", "image");

await fetch("/api/studio/assets/upload", {
  method: "POST",
  body: formData,
});
```

### 2. Сервер загружает в Storage
```typescript
// app/api/studio/assets/upload/route.ts
const filePath = `${user.id}/images/${timestamp}-${filename}`;
await supabase.storage.from("studio-assets").upload(filePath, buffer);

// Сохраняем внутренний формат URL
const url = `supabase://storage/studio-assets/${filePath}`;
await createAsset({ url, ... });
```

### 3. Клиент получает signed URL
```typescript
// Автоматически при отображении
const { signedUrl } = useSignedUrl(asset.url);
```

## Автоматическое обновление

Signed URLs истекают через определенное время. Хуки автоматически обновляют их:

```typescript
// useSignedUrl обновляет URL каждые 50 минут (для 1-часовых URLs)
useEffect(() => {
  const refreshInterval = setInterval(() => {
    generateSignedUrl(); // Обновление
  }, 50 * 60 * 1000);

  return () => clearInterval(refreshInterval);
}, [url]);
```

## Performance

### Кэширование

Signed URLs кэшируются в состоянии компонента:
- ✅ Не генерируются повторно при ре-рендерах
- ✅ Обновляются только при изменении URL или истечении срока
- ✅ Одинаковые URLs не генерируются дважды

### Batch Processing

Для множественных assets используйте batch endpoints:
```typescript
// ❌ Плохо: N запросов
assets.forEach(async (asset) => {
  const url = await getSignedStorageUrl(asset.url);
});

// ✅ Хорошо: 1 запрос
const urls = await getSignedStorageUrls(assets.map(a => a.url));
```

## Безопасность

### RLS Policies

Файлы защищены на уровне базы данных:
```sql
-- Пользователь может читать только свои файлы
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'studio-assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Signed URLs

- ✅ **Временные**: Истекают через N секунд
- ✅ **Токенизированные**: Включают криптографический токен
- ✅ **Проверяемые**: Supabase проверяет токен при каждом запросе

### Нет публичных URL

- ❌ Нельзя угадать URL файла
- ❌ Нельзя получить доступ без токена
- ❌ Нельзя получить доступ к чужим файлам

## Миграция

Миграция автоматически создает bucket и policies:

```bash
# Применить миграцию
supabase db push

# Или через Supabase Dashboard
# Settings → Database → SQL Editor
# Вставить содержимое 20251105000001_create_studio_assets_bucket.sql
```

Проверка:
```sql
-- Проверить bucket
SELECT * FROM storage.buckets WHERE id = 'studio-assets';

-- Проверить policies
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

## Troubleshooting

### Error: "Failed to generate signed URL"

**Причина**: Файл не существует или нет доступа

**Решение**:
```typescript
// Проверить формат URL
console.log(asset.url); // Should start with "supabase://storage/"

// Проверить RLS policies
SELECT * FROM storage.objects WHERE name LIKE '%filename%';
```

### Error: "Token expired"

**Причина**: Signed URL истек

**Решение**: Хук автоматически обновит. Если нет:
```typescript
// Принудительное обновление
const [key, setKey] = useState(0);
<img key={key} ... />
setKey(k => k + 1); // Force refresh
```

### Images not loading

**Решение**:
1. Проверить bucket существует: `studio-assets`
2. Проверить RLS policies активны
3. Проверить формат URL в базе: `supabase://storage/...`
4. Проверить пользователь авторизован

## Best Practices

### 1. Используйте правильные expiration times

```typescript
// Thumbnails: 1 час (часто используются)
{ expiresIn: 3600 }

// Full images: 2 часа (меньше запросов)
{ expiresIn: 7200 }

// Downloads: 5 минут (одноразовые)
{ expiresIn: 300 }
```

### 2. Batch processing для списков

```typescript
// ✅ Хорошо
const enriched = await enrichAssetsWithSignedUrls(assets);

// ❌ Плохо
for (const asset of assets) {
  asset.signedUrl = await getSignedStorageUrl(asset.url);
}
```

### 3. Используйте хуки на клиенте

```typescript
// ✅ Хорошо: Автоматическое обновление
const { signedUrl } = useSignedUrl(url);

// ❌ Плохо: Ручное управление
const [url, setUrl] = useState();
useEffect(() => { /* fetch signed url */ }, []);
```

### 4. Не храните signed URLs в базе

```typescript
// ✅ Хорошо: Хранить internal URL
url: "supabase://storage/studio-assets/..."

// ❌ Плохо: Хранить signed URL (истечет!)
url: "https://...?token=xxx"
```

## Итого

Система signed URLs обеспечивает:

- 🔒 **Безопасность**: Приватные файлы с RLS
- ⚡ **Производительность**: Автоматические трансформации
- 🔄 **Удобство**: Авто-обновление URLs
- 📦 **Масштабируемость**: Batch processing
- 🎨 **Гибкость**: Настраиваемые трансформации

Все assets теперь защищены и оптимизированы! 🚀
