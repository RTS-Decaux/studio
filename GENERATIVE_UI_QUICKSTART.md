# Generative UI - Quick Start Guide 🚀

## What is Generative UI?

Generative UI allows the AI to dynamically create and render rich, interactive React components as part of its responses. Instead of just text, the AI can show beautiful cards for stocks, flights, products, weather, and more!

## ✨ Try It Now!

Just start chatting and ask questions like:

### 💹 Stocks
- "What's Apple's stock price?"
- "Show me Tesla stock information"
- "Compare Microsoft and Google stocks"

### ✈️ Flights
- "Find flights from New York to London"
- "Show me flights to Tokyo"
- "Search for a flight from LA to Paris"

### 🛍️ Shopping
- "Show me some laptops"
- "Find wireless headphones"
- "Search for running shoes"

### 🌤️ Weather
- "What's the weather in San Francisco?"
- "Weather forecast for Tokyo"

### 🎯 Combined Queries
- "I want to fly to Tokyo, what's the weather there, and find me a good laptop"
- "Show me Apple stock and find me Apple products"

## 🎨 What You'll See

1. **Loading States**: Animated skeletons while AI fetches data
2. **Rich Cards**: Beautiful, interactive components with real data
3. **Smooth Animations**: Components fade in smoothly
4. **Responsive Design**: Works great on mobile and desktop

## 📦 Components Available

| Component | Purpose | Example Query |
|-----------|---------|---------------|
| `StockPrice` | Display stock information | "AAPL stock price" |
| `FlightCard` | Show flight details | "Flights to London" |
| `ProductCard` | Display products for sale | "Show laptops" |
| `Weather` | Weather information | "Weather in NYC" |

## 🛠️ For Developers

### File Structure
```
components/generative-ui/
├── stock-price.tsx      # Stock price card
├── flight-card.tsx      # Flight information card
├── product-card.tsx     # Product display card
└── index.tsx           # Exports

lib/ai/tools/
├── get-stock-price.ts   # Stock data fetcher
├── search-flights.ts    # Flight search
└── search-products.ts   # Product search
```

### How It Works

1. **User asks a question** → "What's Apple stock price?"
2. **AI decides to use a tool** → `getStockPrice({ symbol: "AAPL" })`
3. **Loading state shown** → `<StockPriceLoading />`
4. **Data fetched** → Stock price data retrieved
5. **Component rendered** → `<StockPrice data={...} />`

### State Flow

```
tool-call → input-available → output-available
              ↓                    ↓
         Loading Component    Final Component
```

## 📚 Documentation

For detailed documentation, see:
- [`docs/GENERATIVE_UI.md`](./docs/GENERATIVE_UI.md) - Complete implementation guide
- [`docs/GENERATIVE_UI_EXAMPLES.md`](./docs/GENERATIVE_UI_EXAMPLES.md) - More examples

## 🎓 Learn More

- [AI SDK Generative UI Docs](https://sdk.vercel.ai/docs/ai-sdk-ui/generative-user-interfaces)
- [Vercel AI SDK](https://sdk.vercel.ai/)

## 🤝 Contributing

Want to add a new generative UI component? Check out the guide in `docs/GENERATIVE_UI.md` under "Adding New Generative UI Components".

Ideas for new components:
- 📊 Charts and graphs
- 🗺️ Interactive maps  
- 📅 Calendar events
- 🎵 Music players
- 📰 News articles
- 🍕 Restaurant menus

## 💡 Tips

- Be specific in your queries for best results
- Try combining multiple requests in one message
- The AI understands natural language - just ask!
- Components are responsive and work on all devices

---

**Happy chatting! 🎉**
