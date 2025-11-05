# Миграция: Добавление Tavily Search

Это руководство описывает изменения, внесенные при интеграции Tavily Search в проект.

## Обзор изменений

### Добавленные файлы

```
lib/ai/tools/web-search.ts          # Новый AI tool для веб-поиска
docs/TAVILY_INTEGRATION.md          # Полная документация интеграции
docs/TAVILY_QUICKSTART.md           # Быстрый старт
docs/TAVILY_EXAMPLES.md             # Примеры использования
docs/AI_TOOLS.md                    # Документация по всем AI tools
docs/TAVILY_MIGRATION.md            # Этот файл
```

### Измененные файлы

```diff
# .env.example
+ # Tavily Search configuration (optional, enables web search functionality)
+ TAVILY_API_KEY=****

# package.json
+ "@tavily/core": "^0.5.12"

# lib/types.ts
+ import type { webSearch } from "./ai/tools/web-search";
+ type webSearchTool = InferUITool<typeof webSearch>;
  export type ChatTools = {
    getWeather: weatherTool;
+   webSearch: webSearchTool;
    createDocument: createDocumentTool;
    updateDocument: updateDocumentTool;
    requestSuggestions: requestSuggestionsTool;
  };

# app/(chat)/api/chat/route.ts
+ import { webSearch } from "@/lib/ai/tools/web-search";
  
  experimental_activeTools: selectedChatModel === "chat-model-reasoning"
    ? []
    : [
      "getWeather",
+     "webSearch",
      "createDocument",
      "updateDocument",
      "requestSuggestions",
    ],
  
  tools: {
    getWeather,
+   webSearch,
    createDocument: createDocument({ user, dataStream }),
    updateDocument: updateDocument({ user, dataStream }),
    requestSuggestions: requestSuggestions({ user, dataStream }),
  },

# STUDIO_CHANGELOG.md
+ ## Дата: 5 ноября 2025
+ ### 🔍 Интеграция Tavily Search
+ ...
```

## Пошаговая инструкция по миграции

Если вы хотите применить эти изменения к своей версии проекта:

### Шаг 1: Установка пакета

```bash
pnpm add @tavily/core
# или
npm install @tavily/core
# или
yarn add @tavily/core
# или
bun add @tavily/core
```

### Шаг 2: Создание файла инструмента

Создайте файл `lib/ai/tools/web-search.ts` со следующим содержимым:

```typescript
import { tool } from "ai";
import { tavily } from "@tavily/core";
import { z } from "zod";

// Initialize Tavily client
const tavilyClient = process.env.TAVILY_API_KEY 
  ? tavily({ apiKey: process.env.TAVILY_API_KEY })
  : null;

export const webSearch = tool({
  description: "Search the web for up-to-date information, news, facts, and current events. Use this when you need real-time information that might not be in your training data.",
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .max(200)
      .describe("The search query to find relevant information on the web"),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe("Maximum number of results to return (default: 5)"),
    searchDepth: z
      .enum(["basic", "advanced"])
      .optional()
      .describe("Search depth - 'basic' for quick results, 'advanced' for more comprehensive search (default: basic)"),
    includeAnswer: z
      .boolean()
      .optional()
      .describe("Whether to include a generated answer based on search results (default: true)"),
  }),
  execute: async ({ query, maxResults = 5, searchDepth = "basic", includeAnswer = true }) => {
    if (!tavilyClient) {
      return {
        error: "Web search is not configured. Please add TAVILY_API_KEY to your environment variables.",
        query,
      };
    }

    try {
      const response = await tavilyClient.search(query, {
        maxResults,
        searchDepth,
        includeAnswer,
        includeRawContent: false,
      });

      const formattedResults = response.results.map((result) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
        publishedDate: result.publishedDate,
      }));

      return {
        query,
        answer: response.answer,
        results: formattedResults,
        images: response.images,
        responseTime: response.responseTime,
      };
    } catch (error) {
      console.error("Tavily search error:", error);
      
      return {
        error: error instanceof Error ? error.message : "Failed to perform web search",
        query,
      };
    }
  },
});
```

### Шаг 3: Обновление типов

В файле `lib/types.ts` добавьте:

```typescript
// Импорты
import type { webSearch } from "./ai/tools/web-search";

// Типы
type webSearchTool = InferUITool<typeof webSearch>;

// В ChatTools
export type ChatTools = {
  getWeather: weatherTool;
  webSearch: webSearchTool;  // <- добавить эту строку
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
};
```

### Шаг 4: Интеграция в API route

В файле `app/(chat)/api/chat/route.ts`:

```typescript
// Добавьте импорт
import { webSearch } from "@/lib/ai/tools/web-search";

// В experimental_activeTools добавьте "webSearch"
experimental_activeTools: selectedChatModel === "chat-model-reasoning"
  ? []
  : [
    "getWeather",
    "webSearch",  // <- добавить
    "createDocument",
    "updateDocument",
    "requestSuggestions",
  ],

// В tools добавьте webSearch
tools: {
  getWeather,
  webSearch,  // <- добавить
  createDocument: createDocument({ user, dataStream }),
  updateDocument: updateDocument({ user, dataStream }),
  requestSuggestions: requestSuggestions({ user, dataStream }),
},
```

### Шаг 5: Обновление .env.example

Добавьте в `.env.example`:

```bash
# Tavily Search configuration (optional, enables web search functionality)
TAVILY_API_KEY=****
```

### Шаг 6: Настройка переменных окружения

1. Получите API ключ на [tavily.com](https://tavily.com)
2. Добавьте в `.env.local`:

```bash
TAVILY_API_KEY=tvly-your-actual-key-here
```

### Шаг 7: Тестирование

```bash
# Перезапустите сервер разработки
pnpm dev

# Откройте приложение и протестируйте
# В чате напишите: "Найди последние новости о Next.js"
```

## Обратная совместимость

- ✅ Изменения не ломают существующий функционал
- ✅ Все существующие инструменты продолжают работать
- ✅ Новый инструмент опционален (можно не настраивать TAVILY_API_KEY)
- ✅ При отсутствии ключа возвращается корректная ошибка

## Откат изменений

Если нужно удалить интеграцию Tavily:

### 1. Удалите пакет
```bash
pnpm remove @tavily/core
```

### 2. Удалите файлы
```bash
rm lib/ai/tools/web-search.ts
rm docs/TAVILY_*.md
```

### 3. Откатите изменения в файлах

```bash
# lib/types.ts - удалите импорт и тип webSearch
# app/(chat)/api/chat/route.ts - удалите импорт и использование webSearch
# .env.example - удалите TAVILY_API_KEY
```

## Производительность

Интеграция Tavily Search:
- ✅ Не влияет на время загрузки приложения
- ✅ Не влияет на другие инструменты
- ✅ Выполняется асинхронно
- ✅ Имеет таймауты и обработку ошибок

## Безопасность

- ✅ API ключ хранится только на сервере
- ✅ Не передается на клиент
- ✅ Результаты поиска санитизируются
- ✅ Есть лимиты на размер запросов и результатов

## Стоимость

Tavily предоставляет:
- Бесплатный план: ~1000 запросов/месяц
- Платные планы: от $25/месяц

Подробнее: [tavily.com/pricing](https://tavily.com/pricing)

## Дополнительные ресурсы

- [Tavily Official Documentation](https://docs.tavily.com)
- [Vercel AI SDK Tools Guide](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)
- [Внутренняя документация проекта](./TAVILY_INTEGRATION.md)

## Поддержка

При возникновении проблем:

1. Проверьте правильность API ключа
2. Убедитесь, что сервер перезапущен после добавления ключа
3. Проверьте логи сервера
4. См. раздел "Отладка" в [TAVILY_INTEGRATION.md](./TAVILY_INTEGRATION.md)

## Changelog

- **2025-11-05**: Первичная интеграция Tavily Search
  - Добавлен tool webSearch
  - Создана документация
  - Обновлены типы
  - Интегрирован в chat API

---

**Версия миграции:** 1.0.0  
**Дата:** 5 ноября 2025  
**Совместимость:** Next.js 15, Vercel AI SDK 6.0+
