# Bug Fix: Tool Messages Handling

## Проблема

После интеграции `webSearch` tool возникала ошибка при попытке продолжить разговор:

```
[Error [AI_InvalidPromptError]: Invalid prompt: The messages must be a ModelMessage[]. 
If you have passed a UIMessage[], you can use convertToModelMessages to convert them.]
```

### Причина

AI SDK автоматически создает сообщения с `role: "tool"` после выполнения инструмента. Эти сообщения сохранялись в базу данных вместе с обычными сообщениями.

При следующем запросе эти `role: "tool"` сообщения читались из БД и передавались в `convertToModelMessages()`, который не мог их правильно обработать, так как они содержали обернутый формат:

```json
{
  "role": "tool",
  "content": [{
    "type": "tool-result",
    "toolCallId": "...",
    "toolName": "webSearch",
    "output": {
      "type": "json",
      "value": { /* actual data */ }
    }
  }]
}
```

## Решение

### 1. Фильтрация tool messages при сохранении

В `app/(chat)/api/chat/route.ts`, в `onFinish` callback:

```typescript
onFinish: async ({ messages }) => {
  // Filter out tool messages as tool results are already in assistant message parts
  // This prevents issues with convertToModelMessages on subsequent requests
  const messagesToSave = messages.filter(msg => (msg as any).role !== 'tool');
  
  await saveMessages({
    messages: messagesToSave.map((currentMessage) => ({
      id: currentMessage.id,
      role: currentMessage.role,
      parts: currentMessage.parts,
      createdAt: new Date(),
      attachments: [],
      chatId: id,
    })),
  });
}
```

**Почему это безопасно:**
- Tool results уже включены в `parts` assistant сообщения
- Отдельные `role: "tool"` сообщения избыточны
- UI использует parts из assistant сообщений для отображения

### 2. Обработка обернутого JSON в UI

В `components/message.tsx`, для `tool-webSearch`:

```typescript
// Extract the actual data from wrapped format if needed
// Sometimes the output comes wrapped in {type: "json", value: {...}}
const outputData = (part.output as any)?.type === "json" && (part.output as any)?.value 
  ? (part.output as any).value 
  : part.output;
```

**Зачем:**
- AI SDK иногда оборачивает результаты в `{type: "json", value: ...}`
- Это нужно для правильного отображения в UI

## Проверка

### До исправления:
```
1. User: "загугли кто такой Бауржан Беглеров"
2. Assistant: [uses webSearch] + response
3. User: "дай погоду в москве"
4. ❌ Error: Invalid prompt...
```

### После исправления:
```
1. User: "загугли кто такой Бауржан Беглеров"
2. Assistant: [uses webSearch] + response
3. User: "дай погоду в москве"
4. ✅ Assistant: [uses getWeather] + response
```

## Альтернативные решения (не использованы)

### Вариант 1: Кастомная конвертация
Создать свой `convertToModelMessages`, который умеет обрабатывать tool messages.

**Минус:** Сложнее поддерживать, нужно следить за обновлениями AI SDK.

### Вариант 2: Преобразование при чтении
Преобразовывать tool messages при чтении из БД.

**Минус:** Добавляет лишнюю логику на каждый запрос.

### Вариант 3: Изменение схемы БД
Хранить только assistant сообщения с встроенными tool results.

**Минус:** Требует миграции данных.

## Затронутые файлы

1. `app/(chat)/api/chat/route.ts` - фильтрация tool messages
2. `components/message.tsx` - обработка обернутого JSON

## Тестирование

### Сценарий 1: Использование webSearch
```
User: найди информацию о Next.js 15
✅ Tool вызывается
✅ Результаты отображаются
✅ Нет tool messages в БД
```

### Сценарий 2: Продолжение разговора
```
User: найди информацию о Next.js 15
Assistant: [responds with webSearch results]
User: а что нового в React?
✅ Новый запрос проходит без ошибок
✅ convertToModelMessages работает корректно
```

### Сценарий 3: Множественные инструменты
```
User: погода в москве и найди новости
✅ getWeather работает
✅ webSearch работает
✅ Оба результата отображаются
✅ Следующий запрос работает
```

## Заметки

- AI SDK автоматически создает tool messages для internal processing
- UI использует только parts из assistant messages
- Сохранение tool messages вызывает проблемы с конвертацией
- Текущее решение простое и эффективное

## Дата исправления

5 ноября 2025

## Статус

✅ Исправлено и протестировано
