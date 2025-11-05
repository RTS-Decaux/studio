# Template Gallery Guide

## Overview

The Template Gallery (`/studio/templates`) provides a comprehensive collection of pre-made templates for quick generation. Choose from **17 Prompt Templates** and **11 Project Templates** across multiple categories.

## Features

### 🔍 Search & Filter

**Search Bar**
- Search by template name, description, or tags
- Real-time filtering as you type
- Works across both view modes

**Category Filters**
- Filter by category using tabs
- Dynamic badge counters show template count per category
- "All" view shows everything

### 📋 View Modes

#### Prompt Templates (17 total)
Pre-written prompts for quick generation

**Categories:**
- 📷 **Photography** (3): Professional Portrait, Landscape, Product
- 🎬 **Cinematic** (4): Scene, Character, Smooth Motion, Time Lapse
- 🎨 **Art Styles** (4): Oil Painting, Watercolor, Impressionist, Modern Abstract
- 🌸 **Anime** (2): Character, Scene
- 🎮 **3D** (2): 3D Render, Stylized 3D
- 🎁 **Product** (1): Product Photography

**What You Get:**
- Positive prompt (optimized for quality)
- Negative prompt (avoids common issues)
- Compatible generation types (Image/Video/I2I/I2V)
- Tags for easy discovery
- Example subjects to try

#### Project Templates (11 total)
Complete pre-configured settings for specific use cases

**Categories:**
- 📷 **Photography** (2): Portrait Session, Product Showcase
- 🎬 **Animation** (1): Character Animation
- 📱 **Marketing** (3): YouTube Thumbnail, Instagram Story, Logo Animation
- 🎨 **Art** (2): Concept Art, Digital Painting
- 🔬 **Experimental** (1): AI Experiment
- 📱 **Social Media** (2): Social Media Clip, Instagram Story

**What You Get:**
- Pre-configured settings (size, duration, FPS, steps, guidance)
- Recommended model
- Prompt templates
- Negative prompt templates
- All optimized for specific use case

## How to Use

### Method 1: Quick Copy

1. Browse templates in gallery
2. Click **"Copy"** button on card
3. Paste into your generation panel

**Prompt Templates:** Copies positive + negative prompts
**Project Templates:** Copies all settings as formatted text

### Method 2: Detailed View

1. Click **"Details"** button on any template
2. Review full content in modal:
   - Complete prompts
   - All settings
   - Generation types
   - Tags and examples
3. Click **"Copy"** to copy to clipboard
4. Or click **"Use Template"** to apply directly

### Method 3: Direct Application

1. Click **"Details"** button
2. Click **"Use Template"** button
3. Automatically redirects to `/studio/generate`
4. Template applied with all settings

## Template Cards

### Prompt Template Card Shows:

- **Name & Description**: Clear title and what it's for
- **Category Badge**: Emoji icon for quick identification
- **Generation Types**: Badges showing Image/Video/I2I/I2V compatibility
- **Prompt Preview**: First 3-4 lines of the prompt
- **Tags**: First 4 tags + counter for more
- **Examples**: Suggested subjects to try with

### Project Template Card Shows:

- **Icon + Name**: Visual identifier + title
- **Category Badge**: Emoji icon
- **Generation Type**: Single badge (Image/Video)
- **Settings Preview**: Grid showing:
  - 🖼️ Size (aspect ratio)
  - ⏱️ Duration (seconds)
  - 🎯 FPS (frames per second)
  - ⚡ Steps (quality)
  - 🎯 Guidance (prompt adherence)
- **Prompt Preview**: Template text (if included)
- **Tags**: All relevant tags

## Detail Dialog

### Viewing Full Details

**Prompt Templates:**
```
✨ Generation Types
   Badges showing all compatible types

📝 Positive Prompt
   Full prompt text (formatted, scrollable)

🚫 Negative Prompt
   Full negative prompt text

🏷️ Tags
   All tags displayed

💡 Example Subjects
   Suggested subjects to try
```

**Project Templates:**
```
✨ Generation Types
   Badge showing type

⚙️ Pre-configured Settings
   Grid with icons:
   • Size: 1024x1024, 16:9, etc.
   • Duration: 5s, 10s, etc.
   • FPS: 24, 30, 60
   • Steps: 25, 30, 50
   • Guidance: 7, 7.5, etc.

📝 Prompt Template
   Full prompt text

🚫 Negative Prompt
   Full negative prompt text

🤖 Recommended Model
   Model ID badge

🏷️ Tags
   All relevant tags
```

### Actions in Detail Dialog

**Copy Button:**
- Copies all content to clipboard
- Shows "Copied!" confirmation
- Format: Plain text for easy pasting

**Use Template Button:**
- Saves template to localStorage
- Redirects to `/studio/generate`
- Template auto-applies on generation page
- Toast confirmation: "Template ready! Redirecting to generation..."

## Tips

### Finding the Right Template

1. **Start with Category**: Know what you want? Use category tabs
2. **Search by Style**: Looking for "cinematic" or "anime"? Use search
3. **Check Generation Type**: Need video? Look for Video badges
4. **Read Tags**: Tags reveal style and purpose

### Using Prompts Effectively

**Prompt Templates:**
- Replace `[subject]`, `[location]`, etc. with your content
- Example: "Professional Portrait of [subject]" → "Professional Portrait of a business woman"
- Keep negative prompt for quality

**Project Templates:**
- Settings are optimized for specific use cases
- Duration/FPS chosen for best quality
- Steps/Guidance balanced for speed vs quality

### Best Practices

1. **Browse First**: Look through all templates to understand options
2. **Start Simple**: Begin with basic templates, customize later
3. **Mix and Match**: Combine prompts from different templates
4. **Save Favorites**: Copy frequently-used templates to notes
5. **Customize**: Templates are starting points, adjust to your needs

## Template Categories Explained

### Photography 📷
Studio-quality photography prompts with proper lighting, composition, camera settings

### Cinematic 🎬
Movie-quality scenes with dramatic lighting, film grain, professional cinematography

### Art Styles 🎨
Various artistic styles: oil painting, watercolor, impressionist, abstract

### Anime 🌸
Anime and manga style prompts with character focus and vibrant colors

### 3D 🎮
3D renders and stylized 3D art with proper materials and lighting

### Product 🎁
E-commerce and commercial product photography

### Animation 🎬
Character and motion animation templates

### Marketing 📱
Templates optimized for social media, thumbnails, ads

### Social Media 📱
Short-form content optimized for Instagram, TikTok, etc.

## Examples

### Example 1: Creating a Portrait

1. Go to Template Gallery
2. Select "Prompts" view
3. Click "Photography" category
4. Find "Professional Portrait"
5. Click "Details"
6. Replace `[subject]` with "a young entrepreneur"
7. Click "Use Template"
8. Generate!

### Example 2: Creating Instagram Story

1. Select "Projects" view
2. Click "Social Media" category
3. Find "Instagram Story"
4. Click "Details" to review:
   - Duration: 5s
   - FPS: 30
   - Aspect: 9:16 (vertical)
5. Click "Use Template"
6. Adjust prompt if needed
7. Generate!

### Example 3: Finding Cinematic Style

1. Use search bar: "cinematic"
2. Results show all cinematic templates
3. Compare "Cinematic Scene" vs "Cinematic Character"
4. Pick based on your needs
5. Use template

## Integration with Generation Panel

### Template Flow

```
Template Gallery → Select Template → Details Dialog → Use Template
                                           ↓
                                  localStorage save
                                           ↓
                           Redirect to /studio/generate
                                           ↓
                              Auto-apply on page load
                                           ↓
                                    Ready to generate!
```

### What Gets Applied

**From Prompt Templates:**
- Positive prompt → Prompt field
- Negative prompt → Negative Prompt field

**From Project Templates:**
- Image size → Image Size selector
- Duration → Duration slider
- FPS → FPS slider
- Steps → Steps slider
- Guidance → Guidance Scale slider
- Prompt template → Prompt field
- Negative prompt → Negative Prompt field

## Future Enhancements

Planned features:
- [ ] Custom template creation
- [ ] Template favorites
- [ ] Template history
- [ ] User-submitted templates
- [ ] Template ratings
- [ ] Template preview images
- [ ] Export/import templates
- [ ] Template collections
- [ ] AI-suggested templates based on history

## Troubleshooting

**Template not applying?**
- Check localStorage is enabled
- Try manual copy-paste instead
- Clear browser cache

**Can't find a template?**
- Check spelling in search
- Try different category
- Browse "All" to see everything

**Template seems wrong for my model?**
- Check generation type compatibility
- Some templates work better with specific models
- Customize prompt for your model

**Details button not working?**
- Check console for errors
- Refresh page
- Report bug on GitHub

## Support

Need help?
- Check [STUDIO_GUIDE.md](./STUDIO_GUIDE.md)
- Read [STUDIO_QUICKSTART.md](../STUDIO_QUICKSTART.md)
- View [STUDIO_CHANGELOG.md](../STUDIO_CHANGELOG.md)
- Open issue on GitHub
