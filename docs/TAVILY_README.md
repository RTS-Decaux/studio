# 🔍 Tavily Search Integration - Quick Reference

## ⚡ Quick Start

### 1. Get API Key
Visit [tavily.com](https://tavily.com) → Sign up → Copy API key

### 2. Add to Environment
```bash
# .env.local
TAVILY_API_KEY=tvly-your-key-here
```

### 3. Restart Server
```bash
pnpm dev
```

### 4. Test
In chat:
```
Найди последние новости о Next.js 15
```

## 📁 Files Added

### Backend
- `lib/ai/tools/web-search.ts` - Tavily search tool
- `app/(chat)/api/chat/route.ts` - Tool integration ✓
- `lib/types.ts` - TypeScript types ✓

### Frontend
- `components/web-search-result.tsx` - Result display component
- `components/message.tsx` - Tool rendering ✓
- `components/elements/tool.tsx` - Tool header formatting ✓

### Documentation
- `docs/TAVILY_QUICKSTART.md` - Quick start guide
- `docs/TAVILY_INTEGRATION.md` - Full integration guide
- `docs/TAVILY_EXAMPLES.md` - Usage examples
- `docs/TAVILY_MIGRATION.md` - Migration guide
- `docs/AI_TOOLS.md` - All AI tools documentation
- `docs/UI_TOOLS_COMPONENTS.md` - UI components guide
- `docs/TESTING_UI_TOOLS.md` - Testing guide

## 🎨 UI Components

### Tool Accordion (Minimalist Design)

**Closed:**
```
🔧 Web Search              ✓ Completed        ›
```

**Open:**
```
🔧 Web Search              ✓ Completed        ˅

Parameters
{
  "query": "Next.js 15"
}

Result
┌─ Summary ─────────────────────────┐
│ Next.js 15 introduces...          │
└───────────────────────────────────┘

Sources (5)                  250ms
┌─ Next.js 15 Release ────── 95% ─┐
│ Official announcement...         │
│ nextjs.org • Nov 1, 2025         │
└──────────────────────────────────┘
```

### Status Badges

- ⏳ **Running** - Gray with pulse animation
- ✓ **Completed** - Green with checkmark
- ✗ **Error** - Red with X icon
- ⏸ **Pending** - Gray circle

## 🔧 Features

### Search Capabilities
- ✅ Real-time web search
- ✅ Up to 10 results
- ✅ Auto-generated summaries
- ✅ Relevance scoring (0-100%)
- ✅ Source images (up to 6)
- ✅ Publication dates
- ✅ Response time tracking

### Search Modes
- **Basic** (default) - Fast, good for quick facts
- **Advanced** - Deeper, more comprehensive

### UI Features
- ✅ Minimalist accordion design
- ✅ Smooth animations
- ✅ Clickable source cards
- ✅ Image gallery
- ✅ Error handling
- ✅ Mobile responsive
- ✅ Keyboard accessible

## 💡 Usage Examples

### Simple Search
```
Найди информацию о TypeScript 5.6
```

### Deep Search
```
Проанализируй и найди подробную информацию о React Server Components
```

### Multiple Tools
```
Какая погода в Лондоне и найди достопримечательности города
```

### With Reasoning
```
Изучи и сравни производительность различных AI SDK
```

## 🎯 Tool Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| query | string | required | Search query (1-200 chars) |
| maxResults | number | 5 | Results count (1-10) |
| searchDepth | enum | basic | "basic" or "advanced" |
| includeAnswer | boolean | true | Include AI summary |

## 🐛 Troubleshooting

### Tool Not Showing
1. Check `TAVILY_API_KEY` in `.env.local`
2. Restart dev server
3. Check browser console for errors

### No Results
1. Check network tab in DevTools
2. Verify API key is valid
3. Check Tavily API limits

### UI Not Rendering
1. Clear browser cache
2. Check TypeScript errors
3. Verify imports in `message.tsx`

## 📊 API Limits

**Free Tier:**
- 1,000 requests/month
- 5 requests/minute

**Pro Tier:**
- 10,000+ requests/month
- Higher rate limits

Check [tavily.com/pricing](https://tavily.com/pricing)

## 🔐 Security

- ✅ API key stored server-side only
- ✅ Never exposed to client
- ✅ Results sanitized
- ✅ Input validation (1-200 chars)
- ✅ Rate limiting via Tavily

## 📚 Documentation

- [Quick Start](./TAVILY_QUICKSTART.md)
- [Full Integration Guide](./TAVILY_INTEGRATION.md)
- [Usage Examples](./TAVILY_EXAMPLES.md)
- [UI Components](./UI_TOOLS_COMPONENTS.md)
- [Testing Guide](./TESTING_UI_TOOLS.md)
- [All AI Tools](./AI_TOOLS.md)

## 🚀 What's Next?

### Planned Features
- [ ] Result caching
- [ ] Date filtering
- [ ] Advanced sorting
- [ ] Export results
- [ ] Search history
- [ ] Custom domains filter

### How to Contribute
1. Test the feature
2. Report issues
3. Suggest improvements
4. Submit PRs

## 📝 Changelog

**v1.0.0** (Nov 5, 2025)
- ✅ Initial Tavily Search integration
- ✅ WebSearchResult component
- ✅ Tool accordion UI
- ✅ Error handling
- ✅ Full documentation

## 🆘 Support

**Issues?** Check:
1. [Troubleshooting](#-troubleshooting) section
2. [Testing Guide](./TESTING_UI_TOOLS.md)
3. [Tavily Docs](https://docs.tavily.com)

**Questions?** Ask in:
- GitHub Issues
- Team chat
- Documentation

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Date:** November 5, 2025
