# 🛡️ Studio Error Handling System

Централизованная система обработки ошибок для AI Studio, обеспечивающая последовательный пользовательский опыт и упрощающая отладку.

## 📋 Содержание

- [Обзор](#обзор)
- [Типы ошибок](#типы-ошибок)
- [Использование](#использование)
- [API](#api)
- [Примеры](#примеры)

## 🎯 Обзор

Система обработки ошибок Studio состоит из:

1. **`lib/errors.ts`** - Базовая система ошибок с типами `ChatSDKError`
2. **`lib/studio/error-handler.ts`** - Утилиты для Studio-специфичных ошибок
3. **Server Actions** - Валидация и типизированные ошибки на сервере
4. **Client Components** - Красивые toast-уведомления с контекстом

### Преимущества

✅ Последовательные сообщения об ошибках  
✅ Типизированные коды ошибок  
✅ Автоматическая локализация контекста  
✅ Упрощенная отладка  
✅ Улучшенный UX с подсказками

## 🔍 Типы ошибок

### ErrorType

```typescript
type ErrorType =
  | "bad_request"    // 400 - Неверный запрос
  | "unauthorized"   // 401 - Требуется авторизация
  | "forbidden"      // 403 - Доступ запрещен
  | "not_found"      // 404 - Ресурс не найден
  | "rate_limit"     // 429 - Превышен лимит
  | "offline";       // 503 - Сервис недоступен
```

### Surface (Studio)

```typescript
type Surface =
  | "studio_project"    // Проекты
  | "studio_asset"      // Ассеты (изображения/видео)
  | "studio_generation" // Генерации
  | "studio_template"   // Шаблоны
  | "fal_api"          // fal.ai API
  | "file_upload";     // Загрузка файлов
```

### ErrorCode

Формат: `${ErrorType}:${Surface}`

Примеры:
- `not_found:studio_project`
- `rate_limit:studio_generation`
- `bad_request:fal_api`
- `forbidden:studio_asset`

## 📚 API

### Server Actions

#### `ChatSDKError`

Создает типизированную ошибку:

```typescript
import { ChatSDKError } from "@/lib/errors";

throw new ChatSDKError("not_found:studio_project");
throw new ChatSDKError("bad_request:studio_generation", "Prompt is too long");
```

#### Валидация в Actions

```typescript
export async function createProjectAction(title: string, description?: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Валидация
  if (!title || title.trim().length === 0) {
    throw new ChatSDKError("bad_request:studio_project", "Title is required");
  }

  if (title.trim().length > 200) {
    throw new ChatSDKError("bad_request:studio_project", "Title too long");
  }

  try {
    return await createProject({ ... });
  } catch (error: any) {
    if (error.message?.includes("rate limit")) {
      throw new ChatSDKError("rate_limit:studio_project");
    }
    throw new ChatSDKError("bad_request:studio_project", error.message);
  }
}
```

### Client Utilities

#### `showStudioError()`

Показывает ошибку с автоматическим определением контекста:

```typescript
import { showStudioError } from "@/lib/studio/error-handler";

try {
  await generateAction(request);
} catch (error) {
  showStudioError(error, "generation");
}
```

#### `showStudioSuccess()`

Показывает успешное уведомление:

```typescript
import { showStudioSuccess } from "@/lib/studio/error-handler";

showStudioSuccess(
  "Generation started!",
  "Your image is being generated"
);
```

#### `handleStudioError()`

Обрабатывает ошибку и возвращает детали (без показа toast):

```typescript
import { handleStudioError } from "@/lib/studio/error-handler";

try {
  await action();
} catch (error) {
  const details = handleStudioError(error, "project");
  console.log(details.title, details.description, details.action);
}
```

#### `withErrorHandling()`

Обёртка для async функций с автоматической обработкой:

```typescript
import { withErrorHandling } from "@/lib/studio/error-handler";

const project = await withErrorHandling(
  () => createProjectAction(title, description),
  "project",
  { 
    title: "Project created!",
    description: "Your project is ready to use"
  }
);

if (project) {
  router.push(`/studio/${project.id}`);
}
```

## 💡 Примеры

### Пример 1: Создание проекта

```typescript
// app/studio/new/page.tsx
import { showStudioError, showStudioSuccess } from "@/lib/studio/error-handler";

const handleCreate = async () => {
  if (!title.trim()) {
    toast.error("Title required", {
      description: "Please enter a project name"
    });
    return;
  }

  setIsCreating(true);
  try {
    const project = await createProjectAction(title, description);
    showStudioSuccess("Project created!", `${project.title} is ready`);
    router.push(`/studio/${project.id}`);
  } catch (error) {
    showStudioError(error, "project");
  } finally {
    setIsCreating(false);
  }
};
```

### Пример 2: Генерация контента

```typescript
// components/studio/generation-panel-v2.tsx
import { showStudioError, showStudioSuccess } from "@/lib/studio/error-handler";

const handleGenerate = async () => {
  // Валидация на клиенте
  if (!selectedModel) {
    toast.error("Please select a model", {
      description: "Choose an AI model to start generating"
    });
    return;
  }

  setIsGenerating(true);
  try {
    const response = await generateAction(request);
    showStudioSuccess(
      "Generation started!",
      `Your ${generationType.replace("-", " ")} is being generated`
    );
    onGenerationStart?.(response.generationId);
  } catch (error) {
    showStudioError(error, "generation");
  } finally {
    setIsGenerating(false);
  }
};
```

### Пример 3: Обработка fal.ai ошибок

```typescript
// lib/studio/actions.ts
async function processGeneration(generationId: string, request: GenerationRequest) {
  try {
    await updateGeneration(generationId, { status: "processing" });
    
    const falClient = getFalClient();
    const result = await falClient.run(request.modelId, input, {
      onProgress: (status) => console.log(status)
    });

    // Обработка результата...
  } catch (falError: any) {
    // Детальная обработка ошибок fal.ai
    let errorMessage = falError.message || "Unknown fal.ai error";
    
    if (falError.message?.includes("timeout")) {
      errorMessage = "Generation timeout - AI service took too long";
    } else if (falError.message?.includes("rate limit")) {
      errorMessage = "AI service rate limit exceeded";
    } else if (falError.message?.includes("authentication")) {
      errorMessage = "AI service authentication failed";
    }
    
    await updateGeneration(generationId, {
      status: "failed",
      error: errorMessage
    });
  }
}
```

### Пример 4: Загрузка файлов

```typescript
const handleFileUpload = async (file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    toast.error("File too large", {
      description: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
    });
    return;
  }

  try {
    const url = await uploadFileAction(file);
    showStudioSuccess("File uploaded!", "Your file is ready to use");
    return url;
  } catch (error) {
    showStudioError(error, "upload");
  }
};
```

## 🎨 Сообщения об ошибках

### Project Errors

| Code | Message |
|------|---------|
| `not_found:studio_project` | The project was not found or may have been deleted |
| `forbidden:studio_project` | This project belongs to another user |
| `unauthorized:studio_project` | You need to sign in to access this project |
| `bad_request:studio_project` | The project data is invalid |
| `rate_limit:studio_project` | You have reached the maximum number of projects |

### Generation Errors

| Code | Message |
|------|---------|
| `not_found:studio_generation` | The generation was not found |
| `forbidden:studio_generation` | This generation belongs to another user |
| `unauthorized:studio_generation` | You need to sign in to start a generation |
| `bad_request:studio_generation` | The generation request is invalid |
| `rate_limit:studio_generation` | You have exceeded your generation quota |

### fal.ai API Errors

| Code | Message |
|------|---------|
| `bad_request:fal_api` | The request was rejected by the AI service |
| `unauthorized:fal_api` | AI service authentication failed |
| `forbidden:fal_api` | This AI model is not available in your plan |
| `not_found:fal_api` | The requested AI model was not found |
| `rate_limit:fal_api` | AI service rate limit exceeded |
| `offline:fal_api` | AI service is temporarily unavailable |

### File Upload Errors

| Code | Message |
|------|---------|
| `bad_request:file_upload` | File format not supported or too large |
| `unauthorized:file_upload` | You need to sign in to upload files |
| `forbidden:file_upload` | You don't have permission to upload here |
| `rate_limit:file_upload` | You have uploaded too many files |
| `offline:file_upload` | Upload service temporarily unavailable |

## 🔧 Best Practices

### 1. Всегда используйте типизированные ошибки на сервере

❌ **Плохо:**
```typescript
throw new Error("Project not found");
```

✅ **Хорошо:**
```typescript
throw new ChatSDKError("not_found:studio_project");
```

### 2. Добавляйте контекст к ошибкам

❌ **Плохо:**
```typescript
throw new ChatSDKError("bad_request:studio_project");
```

✅ **Хорошо:**
```typescript
throw new ChatSDKError("bad_request:studio_project", "Title is too long (max 200 chars)");
```

### 3. Используйте правильный контекст на клиенте

❌ **Плохо:**
```typescript
showStudioError(error); // generic context
```

✅ **Хорошо:**
```typescript
showStudioError(error, "generation"); // specific context
```

### 4. Валидируйте на клиенте перед отправкой

✅ **Хорошо:**
```typescript
if (!title.trim()) {
  toast.error("Title required");
  return;
}

try {
  await action();
} catch (error) {
  showStudioError(error, "project");
}
```

### 5. Обрабатывайте специфичные ошибки fal.ai

✅ **Хорошо:**
```typescript
try {
  const result = await falClient.run(modelId, input);
} catch (falError) {
  if (falError.message?.includes("timeout")) {
    // Специальная обработка timeout
  } else if (falError.message?.includes("rate limit")) {
    // Специальная обработка rate limit
  }
  throw new Error(customMessage);
}
```

## 🐛 Отладка

### Логирование ошибок

Все ошибки автоматически логируются в `handleStudioError`:

```typescript
console.error(`Studio ${context} error:`, error);
```

### Проверка кодов ошибок

```typescript
import { ChatSDKError } from "@/lib/errors";

if (error instanceof ChatSDKError) {
  console.log(error.type);    // "not_found"
  console.log(error.surface);  // "studio_project"
  console.log(error.message);  // User-friendly message
  console.log(error.cause);    // Optional detailed cause
}
```

### Тестирование ошибок

```typescript
// Искусственно вызвать ошибку для тестирования
throw new ChatSDKError("rate_limit:studio_generation");

// Проверить обработку
try {
  await action();
} catch (error) {
  const details = handleStudioError(error, "generation");
  expect(details.title).toBe("Rate Limit Exceeded");
}
```

## 📝 Checklist для новых фич

При добавлении новых возможностей:

- [ ] Определить возможные типы ошибок
- [ ] Добавить валидацию в server action
- [ ] Использовать `ChatSDKError` с правильными кодами
- [ ] Обработать ошибки на клиенте с `showStudioError`
- [ ] Добавить user-friendly сообщения
- [ ] Протестировать все сценарии ошибок
- [ ] Обновить документацию если нужны новые коды

## 🤝 Contributing

При добавлении новых типов ошибок:

1. Обновите `Surface` type в `lib/errors.ts`
2. Добавьте в `visibilityBySurface` mapping
3. Добавьте case в `getMessageByErrorCode()`
4. Обновите эту документацию
5. Добавьте примеры использования

---

**Версия:** 1.0.0  
**Последнее обновление:** 2025-11-06
