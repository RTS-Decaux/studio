# 🛡️ Studio Error Handling - Quick Reference

## 🎯 Import

```typescript
// Server
import { ChatSDKError } from "@/lib/errors";

// Client
import { showStudioError, showStudioSuccess } from "@/lib/studio/error-handler";
```

## 📝 Server Actions

```typescript
// Throw typed error
throw new ChatSDKError("not_found:studio_project");
throw new ChatSDKError("bad_request:studio_generation", "Prompt too long");

// Common patterns
if (!title?.trim()) {
  throw new ChatSDKError("bad_request:studio_project", "Title required");
}

if (project.userId !== user.id) {
  throw new ChatSDKError("forbidden:studio_project");
}

if (!project) {
  throw new ChatSDKError("not_found:studio_project");
}
```

## 🎨 Client Components

```typescript
// Show error with context
try {
  await generateAction(request);
} catch (error) {
  showStudioError(error, "generation");
}

// Show success
showStudioSuccess("Done!", "Your action completed successfully");

// Manual validation
if (!input) {
  toast.error("Input required", {
    description: "Please provide all required fields"
  });
  return;
}
```

## 🔑 Error Codes

### Format
`${type}:${surface}`

### Types
- `bad_request` (400)
- `unauthorized` (401)
- `forbidden` (403)
- `not_found` (404)
- `rate_limit` (429)
- `offline` (503)

### Surfaces
- `studio_project`
- `studio_asset`
- `studio_generation`
- `studio_template`
- `fal_api`
- `file_upload`

### Examples
- `not_found:studio_project`
- `rate_limit:studio_generation`
- `forbidden:studio_asset`
- `bad_request:fal_api`

## 📊 Common Scenarios

### Project Creation
```typescript
try {
  const project = await createProjectAction(title, desc);
  showStudioSuccess("Project created!", project.title);
} catch (error) {
  showStudioError(error, "project");
}
```

### Generation
```typescript
try {
  const result = await generateAction(request);
  showStudioSuccess("Generation started!", "Check back soon");
} catch (error) {
  showStudioError(error, "generation");
}
```

### File Upload
```typescript
try {
  const url = await uploadFile(file);
  showStudioSuccess("File uploaded!");
} catch (error) {
  showStudioError(error, "upload");
}
```

## ✅ Best Practices

1. ✅ Always use `ChatSDKError` on server
2. ✅ Always provide context to `showStudioError`
3. ✅ Add detailed `cause` for complex errors
4. ✅ Validate on client before server call
5. ✅ Log errors for debugging

## 🔗 Full Documentation

See [STUDIO_ERROR_HANDLING.md](./STUDIO_ERROR_HANDLING.md) for complete guide.
