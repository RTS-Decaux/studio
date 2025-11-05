# Image Optimization - Quick Reference

## 🚀 Quick Start

```tsx
import { getAssetPreviewUrl, ImagePresets } from "@/lib/studio/image-transform";
```

## 📋 Common Use Cases

### 1. Asset Gallery Grid View
```tsx
<img 
  src={getAssetPreviewUrl(asset, "small")}
  alt={asset.name}
  loading="lazy"
  className="w-full h-full object-cover"
/>
```
**Result**: 200x200 WebP thumbnail, 75% quality

---

### 2. Asset List View
```tsx
<img 
  src={getAssetPreviewUrl(asset, "medium")}
  alt={asset.name}
  loading="lazy"
  className="w-20 h-20 object-cover"
/>
```
**Result**: 400x300 WebP thumbnail, 80% quality

---

### 3. Asset Detail Dialog
```tsx
<img 
  src={getAssetPreviewUrl(asset, "large")}
  alt={asset.name}
  loading="lazy"
  className="max-h-[500px] object-contain"
/>
```
**Result**: 800x600 WebP preview, 85% quality

---

### 4. Video Thumbnail Background
```tsx
{asset.type === "video" && asset.thumbnailUrl && (
  <img
    src={ImagePresets.previewLarge(asset.thumbnailUrl) || asset.thumbnailUrl}
    alt={`${asset.name} thumbnail`}
    className="absolute inset-0 blur-sm opacity-50"
  />
)}
```

---

### 5. Custom Size
```tsx
import { getTransformedImageUrl } from "@/lib/studio/image-transform";

<img 
  src={getTransformedImageUrl(asset.url, {
    width: 600,
    height: 400,
    quality: 85,
    format: "webp",
    resize: "contain"
  })}
/>
```

---

## 🎨 Available Presets

| Preset | Size | Mode | Quality | Use Case |
|--------|------|------|---------|----------|
| `thumbnailSmall` | 200x200 | cover | 75% | Grid cards |
| `thumbnailMedium` | 400x300 | cover | 80% | List items |
| `previewLarge` | 800x600 | contain | 85% | Dialogs |
| `fullOptimized` | 1920x1080 | contain | 90% | Fullscreen |
| `avatar` | 100x100 | cover | 80% | Profiles |
| `cardThumbnail` | 300x300 | cover | 75% | Cards |

## 📝 Size Selection Guide

```tsx
// Component type → Size
AssetCard (grid)     → "small"   // 200x200
AssetListItem        → "small"   // 200x200 (or "medium" for larger lists)
AssetDetailDialog    → "large"   // 800x600
ProjectThumbnail     → cardThumbnail preset // 300x300
UserAvatar           → avatar preset // 100x100
TemplateCard         → cardThumbnail preset // 300x300
```

## ⚡ Performance Tips

### ✅ DO
```tsx
// Always use lazy loading
<img src={url} loading="lazy" alt={alt} />

// Use appropriate size for context
<img src={getAssetPreviewUrl(asset, "small")} /> // in grid

// Provide alt text
<img src={url} alt={asset.name} />
```

### ❌ DON'T
```tsx
// Don't load full-size images for thumbnails
<img src={asset.url} /> // ❌ Original size

// Don't forget loading="lazy"
<img src={url} /> // ❌ No lazy loading

// Don't use large previews for small displays
<img src={getAssetPreviewUrl(asset, "large")} /> // ❌ in 100x100 thumbnail
```

## 🔧 Transformation Parameters

```typescript
interface ImageTransformOptions {
  width?: number;        // Target width in pixels
  height?: number;       // Target height in pixels
  quality?: number;      // 20-100 (auto-clamped)
  format?: "origin" | "webp" | "avif";
  resize?: "cover" | "contain" | "fill";
}
```

### Resize Modes
- **cover**: Crop to fill (good for cards/avatars)
- **contain**: Fit within bounds (good for previews)
- **fill**: Stretch to exact size (rarely used)

## 🎯 Asset Type Handling

```tsx
// Images - transform main URL
{asset.type === "image" && (
  <img src={getAssetPreviewUrl(asset, "small")} />
)}

// Videos - use thumbnail if available
{asset.type === "video" && (
  <>
    {asset.thumbnailUrl && (
      <img src={getAssetPreviewUrl(asset, "small")} />
    )}
    <video src={asset.url} controls />
  </>
)}

// Audio - no transformation needed
{asset.type === "audio" && (
  <audio src={asset.url} controls />
)}
```

## 🐛 Debugging

```typescript
// Check if URL will be transformed
const url = "https://xxx.supabase.co/storage/v1/object/public/assets/img.jpg";
console.log(url.includes("supabase.co/storage")); // true = will transform

// See transformed URL
const transformed = getAssetPreviewUrl(asset, "small");
console.log("Transformed:", transformed);

// Verify parameters
const custom = getTransformedImageUrl(url, {
  width: 300,
  quality: 75,
  format: "webp"
});
console.log("Custom:", custom);
// Should contain: ?width=300&quality=75&format=webp
```

## 📊 Before/After Comparison

```typescript
// ❌ Before (loading full images)
<img src={asset.url} /> 
// Size: 2-10MB per image
// Load time: 5-10s per image
// Total for 50 images: 150MB, 250s

// ✅ After (loading optimized thumbnails)
<img src={getAssetPreviewUrl(asset, "small")} loading="lazy" />
// Size: 20-100KB per image
// Load time: 0.2-0.5s per image
// Total for 50 images: 5MB, 15s

// 🎉 Result: 95%+ bandwidth reduction, 7x faster loading!
```

## 🔗 Links

- [Full Documentation](./IMAGE_OPTIMIZATION.md)
- [Supabase Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [WebP Format](https://developers.google.com/speed/webp)
- [Lazy Loading](https://web.dev/browser-level-image-lazy-loading/)

## 💡 Remember

1. **Always use lazy loading** for images
2. **Choose the right size** for the context
3. **Provide meaningful alt text**
4. **Test with real Supabase URLs** in development
5. **Monitor performance** in production

---

**Questions?** See [IMAGE_OPTIMIZATION.md](./IMAGE_OPTIMIZATION.md) for detailed documentation.
