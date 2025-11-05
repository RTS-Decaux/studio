# Supabase Storage Setup Guide

## Required Storage Bucket

The asset upload functionality requires a Supabase Storage bucket named `studio-assets`.

## Setup Instructions

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Name**: `studio-assets`
   - **Public bucket**: ✅ **Enabled** (for public access to assets)
   - **File size limit**: Set according to your needs (recommended: 100MB)
   - **Allowed MIME types**: Leave empty or specify:
     ```
     image/*
     video/*
     audio/*
     ```

### 2. Set Storage Policies

For public access, you need to configure RLS (Row Level Security) policies:

#### Policy 1: Public Read Access
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'studio-assets');
```

#### Policy 2: Authenticated Upload
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'studio-assets' 
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Users can update their own files
```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'studio-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'studio-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Users can delete their own files
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'studio-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Verify Configuration

Test the bucket by uploading a file through the Supabase Dashboard:
1. Go to **Storage** → **studio-assets**
2. Click **Upload file**
3. Select a test image
4. After upload, click the file and copy the public URL
5. Open the URL in a browser - it should display the image

### 4. File Organization

The upload route automatically organizes files by:
```
{userId}/
  ├── images/
  │   └── {timestamp}-{filename}
  ├── videos/
  │   └── {timestamp}-{filename}
  └── audios/
      └── {timestamp}-{filename}
```

Example:
```
123e4567-e89b-12d3-a456-426614174000/
  ├── images/
  │   ├── 1730851234567-screenshot.png
  │   └── 1730851298432-photo.jpg
  └── videos/
      └── 1730851345678-demo.mp4
```

## Environment Variables

Ensure your `.env.local` has the correct Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing Upload

### Via API
```bash
curl -X POST http://localhost:3000/api/studio/assets/upload \
  -H "Cookie: your-session-cookie" \
  -F "file=@/path/to/image.jpg" \
  -F "type=image" \
  -F "projectId=optional-project-id"
```

### Via UI
1. Go to `/studio/assets`
2. Click **Upload Assets**
3. Select files
4. Choose asset type
5. Click **Upload**

## Troubleshooting

### Error: "Failed to upload file: new row violates row-level security policy"
**Solution**: Check that the storage policies are correctly configured (see step 2)

### Error: "Bucket not found"
**Solution**: 
1. Verify the bucket name is exactly `studio-assets`
2. Or change the bucket name in `/app/api/studio/assets/upload/route.ts`:
   ```typescript
   const bucket = "your-bucket-name"; // Change this
   ```

### Error: "File size too large"
**Solution**: Increase the file size limit in Supabase:
1. Go to **Storage** → **studio-assets** → Settings
2. Increase **File size limit**

### Error: "Invalid MIME type"
**Solution**: 
1. Check your allowed MIME types in bucket settings
2. Or allow all types by leaving the field empty

### Images not displaying
**Solution**: 
1. Verify the bucket is **public**
2. Check the public read policy is active
3. Test the public URL directly in browser

## Image Transformations

With the image transformation system in place, uploaded images will be automatically optimized:

```typescript
// Small thumbnail (200x200)
getAssetPreviewUrl(asset, "small")

// Medium preview (400x300)
getAssetPreviewUrl(asset, "medium")

// Large preview (800x600)
getAssetPreviewUrl(asset, "large")
```

All transformations are applied on-the-fly by Supabase Storage's built-in image transformation API.

## Costs

Supabase Storage costs:
- **Free tier**: 1GB storage, 2GB bandwidth/month
- **Pro tier**: $0.021/GB storage, $0.09/GB bandwidth
- **Image transformations**: Included, no extra cost

For typical usage (50 images × 2MB each):
- Storage: 100MB (~$0.002/month)
- Bandwidth: With transformations, ~5MB per page load
- Very cost-effective! 💰

## Migration from Placeholder

If you have existing placeholder URLs in your database:

```sql
-- Find placeholder assets
SELECT * FROM "StudioAsset" 
WHERE url LIKE '%placeholder.com%';

-- These will need to be re-uploaded or deleted
-- No automatic migration possible for placeholder URLs
```

## Next Steps

1. ✅ Create `studio-assets` bucket
2. ✅ Configure storage policies
3. ✅ Test upload via UI
4. ✅ Verify image transformations work
5. ✅ Monitor storage usage in Supabase Dashboard

## Additional Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
