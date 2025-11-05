# Asset Library Guide

## Overview

The Asset Library (`/studio/assets`) provides comprehensive management for all your media files - images, videos, and audio. Upload, organize, view, and manage assets in one place.

## Features

### 📦 Asset Management

**View Modes:**
- **Grid View**: 2-4 column responsive grid with thumbnails
- **List View**: Detailed list with metadata visible

**Filtering:**
- Search by name
- Filter by type (Image/Video/Audio/All)
- Real-time filtering

**Asset Types:**
- 📷 **Images**: PNG, JPG, GIF, WebP (max 10MB)
- 🎬 **Videos**: MP4, MOV, WebM (max 100MB)
- 🎵 **Audio**: MP3, WAV, OGG (max 20MB)

### 🔼 Upload Assets

#### Opening Upload Dialog

1. Click **"Upload"** button in toolbar
2. Or click **"Upload Asset"** in empty state

#### Upload Process

**Select Asset Type:**
```
Choose type before uploading:
- Image (max 10MB)
- Video (max 100MB)
- Audio (max 20MB)
```

**Add Files:**
1. **Drag & Drop**: Drag files into drop zone
2. **Browse**: Click zone to open file picker
3. **Multi-select**: Hold Ctrl/Cmd for multiple files

**File Validation:**
- Type checking (image/video/audio)
- Size limit enforcement
- Format validation
- Preview generation (images)

**Upload:**
1. Review file list
2. Remove unwanted files with X button
3. Click **"Upload X Files"**
4. Watch progress bars
5. See success/error status per file

### 🔍 View Asset Details

#### Opening Details

- Click any asset card in grid view
- Click any asset in list view

#### Detail Dialog Shows

**Preview Section:**
- Full-size image display
- Video player with controls
- Audio placeholder icon

**Metadata:**
```
✓ File size
✓ Dimensions (width × height)
✓ Duration (videos/audio)
✓ Format (PNG, MP4, etc.)
✓ Created date
```

**Source Information:**
```
✓ Source type (upload/generated/imported)
✓ Generation ID (if generated)
✓ Project ID (if associated)
```

**Public URL:**
- Copy URL to clipboard
- One-click copy button

#### Available Actions

**Edit Name:**
1. Click "Edit Name" button
2. Type new name
3. Press Enter to save
4. Or Escape to cancel

**Copy URL:**
- Copies asset URL to clipboard
- Shows "Copied!" confirmation

**Download:**
- Opens asset in new tab for download
- Full resolution/quality

**Open:**
- Opens asset in new browser tab
- View full quality

**Delete:**
- Shows confirmation dialog
- Permanently deletes asset
- Removes from library

### 📊 Asset Cards

#### Grid View Card

**Shows:**
- Thumbnail/preview image
- Type badge (top-right corner)
- File name
- Created date
- File size

**Hover State:**
- Overlay appears
- View and Download buttons
- Border highlight

#### List View Item

**Shows:**
- Square thumbnail (80x80)
- File name
- Type badge
- Created date
- Dimensions
- File size
- View and Download buttons

### 🎯 Asset Organization

#### Source Types

**Upload:**
- Manually uploaded files
- Badge shows "Upload"

**Generated:**
- Created via generation panel
- Linked to generation ID
- Badge shows "Generated"

**Imported:**
- Imported from external sources
- Badge shows "Imported"

#### Project Association

Assets can be associated with projects:
- Set during upload (optional)
- Shown in detail dialog
- Helps organize by project

### 🔐 Security & Validation

**Upload Validation:**
```typescript
Type checking:
  - image/* for images
  - video/* for videos
  - audio/* for audio

Size limits:
  - Images: 10MB max
  - Videos: 100MB max
  - Audio: 20MB max

Format validation:
  - Checks MIME type
  - Verifies file extension
```

**User Authentication:**
- All operations require login
- Assets scoped to user
- No cross-user access

### 🎨 UI Components

#### Empty State

**When no assets exist:**
```
- Upload icon (large)
- "No assets yet" heading
- Description text
- "Upload Asset" CTA button
```

#### Toolbar

**Components:**
```
[Search Bar] [Type Filter] [View Toggle] [Upload Button]
     ↓              ↓             ↓              ↓
  Real-time    All/Image/     Grid/List    Opens dialog
   filter      Video/Audio     toggle
```

#### Asset Count

Shows: "X assets" or "X asset"
- Updates with filtering
- Shows filtered count

### 💡 Tips & Best Practices

**Naming:**
- Use descriptive names
- Include version/iteration numbers
- Example: "hero-banner-v3.jpg"

**Organization:**
- Associate with projects when relevant
- Use consistent naming conventions
- Delete unused assets regularly

**Performance:**
- Optimize images before upload
- Compress videos when possible
- Use appropriate formats

**Workflow:**
```
Generate → Auto-saves to assets
Upload → Manual addition
Import → From external sources

All accessible in one library
```

### 📱 Responsive Design

**Desktop:**
- 4-column grid
- Sidebar visible
- Full toolbar

**Tablet:**
- 3-column grid
- Collapsible sidebar
- Full features

**Mobile:**
- 2-column grid
- Hidden sidebar
- Touch-friendly buttons

## API Integration

### Upload Endpoint

```typescript
POST /api/studio/assets/upload

Body (FormData):
  - file: File
  - type: "image" | "video" | "audio"
  - projectId?: string (optional)

Response:
  {
    id: string,
    url: string,
    thumbnailUrl: string | null,
    metadata: { ... }
  }
```

### Delete Action

```typescript
await deleteAssetAction(assetId);
// Removes from database
// Triggers refresh
```

## Examples

### Example 1: Upload Product Image

1. Open Asset Library
2. Click "Upload"
3. Select "Image" type
4. Drag product photo
5. Review preview
6. Click "Upload 1 File"
7. Wait for success ✓
8. Asset appears in library

### Example 2: Organize by Project

1. Create project "Website Redesign"
2. Generate images in project
3. Assets auto-link to project
4. View in Asset Library
5. Filter by project (future feature)

### Example 3: Share Asset URL

1. Find asset in library
2. Click to open details
3. Click "Copy" next to URL
4. Share URL with team
5. URL is publicly accessible

### Example 4: Batch Upload

1. Click "Upload"
2. Select "Image" type
3. Drag 10 images at once
4. Review all previews
5. Remove any unwanted (X button)
6. Click "Upload 10 Files"
7. Watch progress bars
8. All added to library ✓

## Troubleshooting

**Upload fails:**
- Check file size limits
- Verify file type
- Check internet connection
- Try again

**Preview not showing:**
- Thumbnail may still generate
- Refresh page
- Check file format

**Delete not working:**
- Confirm you own the asset
- Check permissions
- Contact support

**Search returns nothing:**
- Check spelling
- Try different keywords
- Clear search and browse

## Future Enhancements

Planned features:
- [ ] Bulk delete
- [ ] Bulk download
- [ ] Asset collections/folders
- [ ] Tags and categories
- [ ] Favorites/starred
- [ ] Sort options (date, name, size)
- [ ] Advanced filters
- [ ] Asset preview modal
- [ ] Share links with expiry
- [ ] Storage usage stats
- [ ] Duplicate detection
- [ ] Image editing tools
- [ ] Video trimming
- [ ] Format conversion

## Integration with Studio

### Generation Panel

Generated content automatically saves as assets:
```
Generate Image → Asset created
Generate Video → Asset created
Type: "generated"
Source: generation ID linked
```

### Projects

Assets can be project-scoped:
```
Project assets → Show in project
Global assets → Show everywhere
Filter by project (coming soon)
```

### Templates

Use assets as reference inputs:
```
Upload asset → Use in generation
Select from library → Apply as reference
Quick workflow
```

## Support

Need help?
- Read [STUDIO_GUIDE.md](./STUDIO_GUIDE.md)
- Check [STUDIO_CHANGELOG.md](../STUDIO_CHANGELOG.md)
- View [TEMPLATE_GALLERY_GUIDE.md](./TEMPLATE_GALLERY_GUIDE.md)
- Open issue on GitHub

## Technical Details

**Storage:** Supabase Storage (planned) / Placeholder URLs (current)
**Database:** PostgreSQL via Supabase
**Auth:** Session-based authentication
**Upload:** Multi-part form data
**Preview:** Client-side for images
**Metadata:** Extracted server-side
