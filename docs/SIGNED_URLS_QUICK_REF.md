# Signed URLs - Quick Reference

## 🚀 Быстрый старт

### 1. Миграция (один раз)
```bash
supabase db push
# Автоматически создаст bucket и RLS policies
```

### 2. Client-side использование
```tsx
import { useAssetSignedUrl } from "@/hooks/use-signed-url";

function AssetCard({ asset }) {
  const { signedUrl, loading } = useAssetSignedUrl(asset, "small");
  
  return loading ? <Spinner /> : <img src={signedUrl} alt={asset.name} />;
}
```

### 3. Server-side использование
```typescript
import { getSignedStorageUrl } from "@/lib/studio/signed-urls";

const signedUrl = await getSignedStorageUrl(asset.url, {
  expiresIn: 3600,
  transform: { width: 400, quality: 80 }
});
```

## 📋 Common Patterns

### Asset Gallery (Grid)
```tsx
const { signedUrl, loading } = useAssetSignedUrl(asset, "small");
// Автоматически: 200x200 WebP, 1 час expiration
```

### Asset Detail (Large Preview)
```tsx
const { signedUrl } = useAssetSignedUrl(asset, "large");
// Автоматически: 800x600 WebP, 1 час expiration
```

### Video with Thumbnail
```tsx
const { signedUrl: videoUrl } = useSignedUrl(asset.url);
const { signedUrl: thumbUrl } = useAssetSignedUrl(asset, "medium");

<video src={videoUrl} poster={thumbUrl} controls />
```

### Download Button
```tsx
const handleDownload = async () => {
  const response = await fetch("/api/studio/assets/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: asset.url,
      expiresIn: 300, // 5 минут
      download: asset.name
    })
  });
  const { signedUrl } = await response.json();
  window.open(signedUrl, "_blank");
};
```

### Multiple Assets (Batch)
```tsx
const urls = assets.map(a => a.url);
const { signedUrls } = useSignedUrls(urls, {
  transform: { width: 200, quality: 75 }
});

assets.map((asset, i) => (
  <img key={asset.id} src={signedUrls[i]} />
));
```

## ⚙️ Transformation Options

```typescript
interface TransformOptions {
  width?: number;        // Target width
  height?: number;       // Target height
  quality?: number;      // 20-100 (JPEG/WebP quality)
  format?: "origin" | "webp" | "avif";
  resize?: "cover" | "contain" | "fill";
}
```

### Sizes Guide
```typescript
"small"  → { width: 200, height: 200, resize: "cover" }
"medium" → { width: 400, height: 300, resize: "cover" }
"large"  → { width: 800, height: 600, resize: "contain" }
```

## 🔒 Security Checklist

- ✅ Bucket `studio-assets` is **private**
- ✅ RLS policies applied (see migration)
- ✅ Files organized: `{userId}/{type}s/{file}`
- ✅ Signed URLs expire after N seconds
- ✅ Auto-refresh before expiration
- ✅ No public access to files

## 🐛 Troubleshooting

### "Failed to generate signed URL"
```typescript
// Check URL format
console.log(asset.url); 
// Should be: "supabase://storage/studio-assets/..."

// Not: "https://..." or "placeholder.com/..."
```

### Images not loading
1. Check bucket exists: `studio-assets`
2. Run migration if not applied
3. Check user is authenticated
4. Check URL format in database

### Slow loading
```typescript
// ❌ Bad: Requesting full size for thumbnails
useAssetSignedUrl(asset, "large"); // In small card

// ✅ Good: Appropriate size
useAssetSignedUrl(asset, "small"); // In thumbnail
```

## 📊 Performance Tips

### 1. Use appropriate sizes
```tsx
// Grid cards
useAssetSignedUrl(asset, "small");

// List items
useAssetSignedUrl(asset, "medium");

// Detail view
useAssetSignedUrl(asset, "large");
```

### 2. Batch processing
```tsx
// ✅ Good: 1 request
const { signedUrls } = useSignedUrls(assets.map(a => a.url));

// ❌ Bad: N requests
assets.map(a => useSignedUrl(a.url));
```

### 3. Lazy loading
```tsx
<img src={signedUrl} alt={asset.name} loading="lazy" />
```

## 🔗 API Reference

### Client Hooks
- `useSignedUrl(url, options)` - Single URL
- `useAssetSignedUrl(asset, size)` - Smart asset URL
- `useSignedUrls(urls, options)` - Multiple URLs

### Server Functions
- `getSignedStorageUrl(url, options)` - Generate signed URL
- `getAssetSignedUrl(asset, size)` - Smart generation
- `SignedUrlPresets.thumbnailSmall(url)` - Preset sizes
- `enrichAssetsWithSignedUrls(assets)` - Batch enrich

### API Endpoints
- `POST /api/studio/assets/signed-url` - Generate signed URLs

## 💡 Examples

### Profile Avatar
```tsx
const { signedUrl } = useSignedUrl(user.avatar, {
  transform: {
    width: 100,
    height: 100,
    resize: "cover",
    quality: 80,
    format: "webp"
  }
});
```

### Responsive Image
```tsx
const { signedUrl: small } = useSignedUrl(image, {
  transform: { width: 400 }
});
const { signedUrl: large } = useSignedUrl(image, {
  transform: { width: 1200 }
});

<picture>
  <source media="(min-width: 768px)" srcSet={large} />
  <img src={small} alt="Responsive" />
</picture>
```

### Custom Expiration
```tsx
// Short-lived (5 minutes for downloads)
const { signedUrl } = useSignedUrl(asset.url, {
  expiresIn: 300
});

// Long-lived (2 hours for cached content)
const { signedUrl } = useSignedUrl(asset.url, {
  expiresIn: 7200
});
```

---

**Full Documentation:** See `docs/SIGNED_URLS_GUIDE.md`

**Migration File:** `supabase/migrations/20251105000001_create_studio_assets_bucket.sql`
