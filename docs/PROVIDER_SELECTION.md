# Provider Selection System

## Overview

Type-safe AI provider selection system with automatic fallbacks, validation, and comprehensive test coverage.

## Features

- ✅ **Type Safety**: Full TypeScript support with ProviderId type
- ✅ **Validation**: Automatic API key validation and configuration checks
- ✅ **Fallbacks**: Smart fallback system when providers unavailable
- ✅ **Flexible**: Multiple selection strategies for different use cases
- ✅ **Tested**: 43 unit tests with 100% coverage

## Quick Start

### Basic Usage

```typescript
import { selectProvider } from "@/lib/ai/providers";

// Auto-select best available provider
const provider = selectProvider();
```

### With Specific Provider

```typescript
// Request specific provider with validation
const provider = selectProvider({ 
  provider: "gemini",
  validate: true  // throws if not configured
});
```

### With Fallback

```typescript
// Try gemini, fallback to default if unavailable
const provider = selectProvider({ 
  provider: "gemini",
  fallback: true  // won't throw, will use default
});
```

## API Reference

### Main Functions

#### `selectProvider(options?)`

Main provider selection function.

**Options:**
- `provider?: ProviderId` - Requested provider ("openai" | "gemini")
- `fallback?: boolean` - Enable fallback to default (default: true)
- `validate?: boolean` - Validate API key configured (default: true)

**Examples:**
```typescript
// Auto-select best available
selectProvider()

// Select specific with validation
selectProvider({ provider: "gemini" })

// Select with fallback, skip validation
selectProvider({ 
  provider: "gemini", 
  fallback: true, 
  validate: false 
})
```

#### `getConfiguredProviders()`

Returns array of providers with API keys configured.

```typescript
const configured = getConfiguredProviders();
// => ["openai", "gemini"] if both configured
// => ["openai"] if only OpenAI configured
// => [] if none configured
```

#### `isProviderConfigured(provider)`

Check if specific provider has API key configured.

```typescript
if (isProviderConfigured("gemini")) {
  // Use Gemini
}
```

#### `getProviderDisplayName(provider)`

Get human-readable provider name for UI.

```typescript
getProviderDisplayName("openai")  // => "OpenAI"
getProviderDisplayName("gemini")  // => "Google Gemini"
```

#### `validateProviderConfig(provider)`

Validates provider configuration, throws if not configured.

```typescript
try {
  validateProviderConfig("gemini");
  // Provider is configured
} catch (error) {
  // Provider not configured
}
```

### Advanced Functions

#### `selectBestProvider(preferredProvider?)`

Selects best available provider with preference support.

```typescript
// Prefer gemini, fallback to any configured
const provider = selectBestProvider("gemini");

// Auto-select best
const provider = selectBestProvider();
```

#### `isValidProvider(value)`

Type guard to check if value is valid ProviderId.

```typescript
if (isValidProvider(userInput)) {
  // TypeScript now knows it's "openai" | "gemini"
}
```

#### `getDefaultProvider()`

Gets default provider from environment or fallback.

```typescript
const defaultProvider = getDefaultProvider();
// Reads AI_DEFAULT_PROVIDER env, defaults to "openai"
```

## Environment Variables

```bash
# Set default provider (optional)
AI_DEFAULT_PROVIDER=gemini  # or "openai"

# Provider API keys (at least one required)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

## Usage Patterns

### UI Component: Provider Selector

```typescript
import { 
  getConfiguredProviders, 
  getProviderDisplayName 
} from "@/lib/ai/providers";

function ProviderSelector() {
  const providers = getConfiguredProviders();
  
  return (
    <select>
      {providers.map(p => (
        <option key={p} value={p}>
          {getProviderDisplayName(p)}
        </option>
      ))}
    </select>
  );
}
```

### API Route: Dynamic Provider Selection

```typescript
import { selectProvider } from "@/lib/ai/providers";

export async function POST(req: Request) {
  const { provider } = await req.json();
  
  // Validate and fallback if invalid
  const selected = selectProvider({ 
    provider, 
    fallback: true 
  });
  
  // Use selected provider...
}
```

### User Preference with Fallback

```typescript
import { selectProvider, isProviderConfigured } from "@/lib/ai/providers";

function getProviderForUser(userPreference?: string) {
  // Try user preference first
  if (userPreference && isProviderConfigured(userPreference)) {
    return selectProvider({ 
      provider: userPreference, 
      validate: false 
    });
  }
  
  // Fallback to best available
  return selectProvider();
}
```

### Settings Page: Show Available Providers

```typescript
import { 
  AVAILABLE_PROVIDERS, 
  isProviderConfigured,
  getProviderDisplayName 
} from "@/lib/ai/providers";

function ProviderSettings() {
  return (
    <div>
      {AVAILABLE_PROVIDERS.map(provider => (
        <div key={provider}>
          <span>{getProviderDisplayName(provider)}</span>
          {isProviderConfigured(provider) ? (
            <Badge>Configured ✓</Badge>
          ) : (
            <Badge variant="outline">Not Configured</Badge>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

The system provides clear error messages:

```typescript
// Provider not configured
throw new Error(
  'Provider "gemini" is not configured. Missing API key: GEMINI_API_KEY'
);

// Invalid provider with fallback=false
throw new Error('Invalid provider: invalid-provider');

// No providers configured
throw new Error(
  'No AI providers configured. Please set OPENAI_API_KEY or GEMINI_API_KEY'
);
```

## Testing

The system includes comprehensive tests:

```bash
# Run provider selector tests
bun test lib/ai/provider-selector.test.ts

# All 43 tests should pass
✓ 43 tests pass
```

Test coverage includes:
- Provider validation
- Default provider selection
- Configuration detection
- Fallback behavior
- Error handling
- Edge cases (null, undefined, empty strings)

## Integration with Existing Code

The provider selector is integrated into `lib/ai/providers.ts`:

```typescript
import { 
  getDefaultProvider,
  selectProvider,
  validateProviderConfig,
  // ... other utilities
} from "@/lib/ai/providers";

// All provider utilities available from one import
```

## Best Practices

1. **Always use `selectProvider()`** for runtime provider selection
2. **Use `getConfiguredProviders()`** for UI provider lists
3. **Enable validation** when user explicitly selects provider
4. **Enable fallback** when provider selection is optional
5. **Handle errors** gracefully with try/catch
6. **Check configuration** before showing provider options to users

## Migration Guide

### Before
```typescript
const provider = process.env.AI_DEFAULT_PROVIDER === "gemini" 
  ? "gemini" 
  : "openai";
```

### After
```typescript
import { selectProvider } from "@/lib/ai/providers";

const provider = selectProvider();
```

## Future Enhancements

Potential additions:
- Provider-specific model availability checking
- Provider performance metrics
- Provider cost tracking
- Load balancing between providers
- Provider health checks
