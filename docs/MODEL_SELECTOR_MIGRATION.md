# Model Selector Migration Guide

## 📋 Overview

The model selector UI has been migrated from the input toolbar to the chat header, following the ChatGPT design pattern.

## 🔄 Changes Summary

### Old Implementation (Deprecated)
- **Location**: `components/multimodal-input.tsx`
- **Component**: `ModelSelectorCompact`
- **Position**: Inside the prompt input toolbar (bottom of chat)
- **Status**: ❌ **DEPRECATED** (but kept for backwards compatibility)

### New Implementation (Current)
- **Location**: `components/model-selector-header.tsx`
- **Component**: `ModelSelectorHeader`
- **Position**: Chat header (top of chat, next to sidebar toggle)
- **Status**: ✅ **ACTIVE**

## 🎯 Why the Migration?

1. **Better UX**: Matches ChatGPT's proven design pattern
2. **Visibility**: Model selection is always visible in header
3. **Cleaner Input**: Keeps the input area focused on text entry
4. **Consistency**: Aligns with modern AI chat interfaces

## 🏗️ Architecture

### New Component Structure

```
components/
├── model-selector-header.tsx    ← New main component
├── chat-header.tsx              ← Integrated here
└── multimodal-input.tsx         ← Old component deprecated
```

### Data Flow

```typescript
// In chat.tsx
const [currentModelId, setCurrentModelId] = useState<ChatModelId>();
const [currentProviderId, setCurrentProviderId] = useState<ModelProviderId>();

// Passed to header
<ChatHeader
  selectedModelId={currentModelId}
  selectedProviderId={currentProviderId}
  onModelChange={setCurrentModelId}
  onProviderChange={setCurrentProviderId}
/>
```

## 📝 Implementation Details

### ModelSelectorHeader Features

1. **Provider Selection** (if multiple configured)
   - Shows "ChatGPT" vs "Google"
   - Includes descriptions ("GPT модели", "Gemini модели")
   - Visual checkmark for active provider

2. **Model Selection**
   - Beautiful Russian labels:
     - "Auto" - Решает, как долго думать
     - "Instant" - Отвечает сразу
     - "Thinking" - Думает дольше, чтобы получить лучшие ответы
   - Two-line display (name + description)
   - Visual checkmark for active model

3. **Button Display**
   - Format: "ChatGPT 5" or "Google 2.5"
   - Shows provider + version number
   - Minimal, clean design

4. **Persistence**
   - Uses existing `saveChatModelAsCookie()`
   - Uses existing `saveProviderAsCookie()`
   - Optimistic updates with `useState`

## 🔧 Technical Details

### Props Interface

```typescript
interface ModelSelectorHeaderProps {
  selectedModelId: ChatModelId;
  selectedProviderId?: ModelProviderId;
  onModelChange?: (modelId: ChatModelId) => void;
  onProviderChange?: (providerId: ModelProviderId) => void;
  className?: string;
}
```

### Model Display Mapping

```typescript
const MODEL_DISPLAY_NAMES: Record<
  ModelProviderId,
  Record<ChatModelId, { label: string; description: string; version?: string }>
> = {
  openai: {
    "chat-model": { label: "Auto", description: "...", version: "5" },
    "chat-model-fast": { label: "Instant", description: "...", version: "5" },
    "chat-model-reasoning": { label: "Thinking", description: "...", version: "5" },
  },
  gemini: {
    "chat-model": { label: "Auto", description: "...", version: "2.5" },
    // ...
  },
};
```

## ⚠️ Deprecated Components

### ModelSelectorCompact

**Status**: Deprecated but not removed

**Location**: `components/multimodal-input.tsx` (lines ~482-642)

**Reason for keeping**:
- Backwards compatibility
- Potential future mobile-specific use case
- Reference implementation

**Current state**: Commented out in JSX, but function kept

**Removal plan**: Consider removing in v2.0 or after 3-6 months if no issues arise

## 🚀 Migration Checklist

For other projects wanting to implement similar changes:

- [ ] Create `model-selector-header.tsx` with provider/model display logic
- [ ] Update `chat-header.tsx` to include new selector
- [ ] Pass state and callbacks from `chat.tsx`
- [ ] Add proper TypeScript types for all props
- [ ] Implement optimistic updates
- [ ] Add cookie persistence
- [ ] Test provider switching
- [ ] Test model switching
- [ ] Verify responsive design
- [ ] Deprecate old component with comments
- [ ] Update documentation

## 📚 Related Files

- `components/model-selector-header.tsx` - New implementation
- `components/chat-header.tsx` - Integration point
- `components/chat.tsx` - State management
- `components/multimodal-input.tsx` - Old deprecated implementation
- `lib/ai/provider-selector.ts` - Provider logic
- `lib/ai/models.ts` - Model definitions
- `lib/ai/providers.ts` - Provider definitions
- `app/(chat)/actions.ts` - Cookie persistence actions

## 🎨 Design Reference

The design is based on ChatGPT's model selector:
- Clean, minimal button in header
- Dropdown with grouped content
- Two-line items (name + description)
- Visual indicators (checkmarks) for active selections
- Responsive and accessible

## 📅 Timeline

- **November 5, 2025**: Migration completed
- **Initial implementation**: Provider selection with full tests
- **UI redesign**: ChatGPT-style interface
- **Header migration**: Moved from input to header

## 🤝 Contributing

When making changes to model selection:

1. Update `ModelSelectorHeader` component
2. Maintain backwards compatibility
3. Update this documentation
4. Test with both providers (OpenAI, Google)
5. Verify cookie persistence
6. Check responsive design

## ❓ FAQ

**Q: Why keep the old component?**
A: Backwards compatibility and potential mobile-specific needs.

**Q: Can we remove it now?**
A: Not recommended. Wait 3-6 months to ensure no issues.

**Q: How to add a new provider?**
A: Update `MODEL_DISPLAY_NAMES` in `model-selector-header.tsx` and provider logic in `lib/ai/`.

**Q: How to add a new model?**
A: Add to `chatModels` in `lib/ai/models.ts` and update `MODEL_DISPLAY_NAMES`.

## 📞 Support

For questions or issues, refer to:
- Code comments in `model-selector-header.tsx`
- Provider selector tests in `lib/ai/provider-selector.test.ts`
- This migration guide

---

Last updated: November 5, 2025
