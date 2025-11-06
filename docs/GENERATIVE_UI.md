# Generative UI Implementation

This project now includes a complete **Generative User Interfaces** implementation using the Vercel AI SDK. Generative UI allows the AI to dynamically render rich, interactive React components as part of its responses.

## 📚 Overview

Generative UI goes beyond text-based responses by enabling the AI to:
- Render interactive, styled components in real-time
- Show loading states while data is being fetched
- Display rich data visualizations (stocks, flights, products, weather)
- Create a more engaging and intuitive user experience

## 🎨 Available Components

### 1. Stock Price Card (`StockPrice`)

Displays real-time stock information with visual indicators for price changes.

**Features:**
- Current price with change indicators
- High/Low/Open/Previous Close data
- Volume and Market Cap information
- Color-coded positive/negative changes
- Smooth animations

**Usage in Chat:**
```
User: "What's the current price of Apple stock?"
AI: [Renders StockPrice component with AAPL data]
```

### 2. Flight Card (`FlightCard`)

Shows flight information in a beautiful, airline-style card.

**Features:**
- Departure and arrival information
- Flight duration and status
- Gate information
- Price details
- Status indicators (on-time, delayed, boarding, etc.)

**Usage in Chat:**
```
User: "Find me a flight from New York to London"
AI: [Renders FlightCard component with flight details]
```

### 3. Product Card (`ProductCard`)

Displays product information for e-commerce searches.

**Features:**
- Product image with lazy loading
- Ratings and reviews
- Price with discounts
- Stock availability
- Category and brand information
- Interactive "Add to Cart" button

**Usage in Chat:**
```
User: "Show me some good laptops"
AI: [Renders multiple ProductCard components]
```

### 4. Weather Widget (`Weather`)

Beautiful, gradient-based weather display (existing component, enhanced).

**Features:**
- Current temperature with icon
- Hourly forecast
- Sunrise/sunset times
- Day/night theme adaptation

## 🛠️ Implementation Details

### Architecture

The implementation uses the **AI SDK UI** pattern with the following components:

1. **Tools** (`lib/ai/tools/`)
   - `get-stock-price.ts` - Fetches stock data
   - `search-flights.ts` - Searches for flights
   - `search-products.ts` - Searches for products

2. **UI Components** (`components/generative-ui/`)
   - `stock-price.tsx` - Stock card with loading state
   - `flight-card.tsx` - Flight information card
   - `product-card.tsx` - Product display card
   - `index.tsx` - Exports all components

3. **Message Rendering** (`components/message.tsx`)
   - Handles tool call states (input-available, output-available, output-error)
   - Renders loading states while AI processes
   - Shows final components with data

### Tool Call States

Generative UI tools use the `generate` function pattern from AI SDK, which automatically handles streaming:

1. **`yield`** - Stream loading states or intermediate UI
2. **`return`** - Return the final UI component
3. **Error handling** - Automatic error state management

Example implementation with `generate`:

```tsx
export const getStockPriceUI = tool({
  description: "Get stock price",
  inputSchema: z.object({
    symbol: z.string(),
  }),
  generate: async function* ({ symbol }) {
    // Yield loading state
    yield <StockPriceLoading symbol={symbol} />;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch data
    const data = await fetchStockData(symbol);
    
    // Return final component
    return <StockPrice data={data} />;
  },
});
```

The AI SDK automatically:
- Streams the yielded loading component to the client
- Shows the final component when returned
- Handles errors and displays error states

### Adding New Generative UI Components

To add a new generative UI component:

1. **Create the Component** (`components/generative-ui/your-component.tsx`):
```tsx
export type YourData = {
  // Define your data structure
};

export function YourComponent({ data }: { data: YourData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Your UI */}
    </motion.div>
  );
}

export function YourComponentLoading() {
  return <div>Loading...</div>;
}
```

2. **Create the Tool** (`lib/ai/tools/your-tool-ui.tsx`):
```tsx
import { tool } from "ai";
import { z } from "zod";
import { YourComponent, YourComponentLoading } from "@/components/generative-ui/your-component";

export const yourToolUI = tool({
  description: "What this tool does",
  inputSchema: z.object({
    param: z.string().describe("Parameter description"),
  }),
  generate: async function* ({ param }) {
    // Yield loading state
    yield <YourComponentLoading />;
    
    // Fetch or generate data
    await new Promise(resolve => setTimeout(resolve, 1000));
    const data = await fetchData(param);
    
    // Return final UI component
    return <YourComponent data={data} />;
  },
});
```

3. **Register the Tool** (`app/(chat)/api/chat/route.ts`):
```tsx
import { yourToolUI } from "@/lib/ai/tools/your-tool-ui";

// Add to experimental_activeTools array
experimental_activeTools: [
  // ... existing tools
  "yourToolUI",
],

// Add to tools object
tools: {
  // ... existing tools
  yourToolUI,
},
```

4. **Add Rendering Logic** (`components/message.tsx`):
```tsx
// In the message parts mapping:
// With the generate pattern, the component comes pre-rendered
if (type === "tool-yourToolUI") {
  const { toolCallId, state } = part;

  if (state === "output-available" && part.output) {
    // The output IS the React component
    return <div key={toolCallId}>{part.output}</div>;
  }

  if (state === "output-error") {
    return <div key={toolCallId}>Error: {part.errorText}</div>;
  }

  return null;
}
```

5. **Add to Reasoning Trace** (optional):
```tsx
const toolLabels: Record<string, string> = {
  // ... existing labels
  "tool-yourToolUI": "Your tool action description",
};
```

## 🔄 The `generate` Pattern

The key difference from traditional tool usage is the `generate` function:

```tsx
// ❌ Old way: return data, render on client
execute: async ({ param }) => {
  const data = await fetchData(param);
  return data; // Client must render this
}

// ✅ New way: yield loading, return component
generate: async function* ({ param }) {
  yield <LoadingComponent />; // Streamed immediately
  const data = await fetchData(param);
  return <FinalComponent data={data} />; // Streamed when ready
}
```

Benefits:
- **Progressive Enhancement**: Users see loading states immediately
- **Server-Side Rendering**: Components render on server with data
- **Simpler Client Logic**: No need for complex state management
- **Better UX**: Smooth transitions from loading to content

## 🎯 Best Practices

1. **Loading States**: Always provide a loading skeleton that matches the final component's layout
2. **Error Handling**: Display user-friendly error messages with clear actions
3. **Animations**: Use `framer-motion` for smooth entrance animations
4. **Responsive Design**: Ensure components work on mobile and desktop
5. **Type Safety**: Define proper TypeScript types for all data structures
6. **Accessibility**: Include proper ARIA labels and keyboard navigation

## 🧪 Testing

Test your generative UI by asking questions like:

- **Stocks**: "What's Tesla's stock price?", "Show me Apple stock"
- **Flights**: "Find flights from NYC to LA", "Search for flights to Tokyo"
- **Products**: "Show me laptops", "Find running shoes", "Search for headphones"
- **Weather**: "What's the weather in San Francisco?" (existing)

## 📖 Resources

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [AI SDK UI Generative Interfaces](https://sdk.vercel.ai/docs/ai-sdk-ui/generative-user-interfaces)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🚀 Future Enhancements

Potential additions:
- **Charts and Graphs**: Real-time data visualization with Recharts
- **Maps**: Interactive maps with location data
- **Calendars**: Event scheduling and availability
- **Forms**: Dynamic form generation based on context
- **Media Players**: Embedded audio/video content
- **Timelines**: Event sequences and histories
- **Tables**: Complex data grids with sorting and filtering
