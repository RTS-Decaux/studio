# Generative UI Examples

This document provides concrete examples of how to interact with the generative UI features in the chatbot.

## 💹 Stock Price Examples

### Basic Stock Query
```
User: "What's Apple's stock price?"
```
**AI Response:**
- Calls `getStockPrice` tool with symbol "AAPL"
- Shows `StockPriceLoading` component
- Renders `StockPrice` component with current data

### Multiple Stocks
```
User: "Compare Tesla and Google stock prices"
```
**AI Response:**
- Calls `getStockPrice` twice
- Shows two `StockPrice` components side by side
- Provides text comparison

### Stock Information Request
```
User: "Give me detailed information about Microsoft stock"
```
**AI Response:**
- Fetches MSFT stock data
- Shows price, change, volume, market cap
- Provides additional context about the stock

## ✈️ Flight Search Examples

### Basic Flight Search
```
User: "Find me a flight from New York to London"
```
**AI Response:**
- Calls `searchFlights` tool
- Shows `FlightCardLoading` skeleton
- Renders `FlightCard` with flight details

### Specific Date
```
User: "Show me flights from San Francisco to Tokyo on December 25th"
```
**AI Response:**
- Parses date from query
- Searches flights with specific date
- Displays flight card with departure date

### Multiple Routes
```
User: "What are my options for flying from LA to Paris?"
```
**AI Response:**
- Searches for flights
- May show multiple `FlightCard` components
- Compares different options

## 🛍️ Product Search Examples

### General Search
```
User: "Show me some laptops"
```
**AI Response:**
- Calls `searchProducts` with query "laptops"
- Shows loading skeletons
- Renders 3 `ProductCard` components
- Displays various laptop options

### Specific Product
```
User: "Find me wireless headphones"
```
**AI Response:**
- Searches for headphones
- Shows product cards with images, prices, ratings
- Includes "Add to Cart" buttons

### Category Filter
```
User: "Search for electronics"
```
**AI Response:**
- Filters by category
- Shows various electronic products
- Displays in scrollable grid

### Brand-Specific
```
User: "Show me Nike shoes"
```
**AI Response:**
- Searches for Nike products in sports category
- Displays relevant items
- Shows pricing and availability

## 🌤️ Weather Examples (Existing)

### Current Weather
```
User: "What's the weather in San Francisco?"
```
**AI Response:**
- Calls `getWeather` tool
- Shows weather accordion
- Displays current temperature, forecast, sunrise/sunset

### Multiple Locations
```
User: "Compare weather in New York and London"
```
**AI Response:**
- Fetches weather for both locations
- Shows two weather widgets
- Provides comparison in text

## 🔄 Combined Examples

### Travel Planning
```
User: "I want to fly from NYC to Tokyo, what's the weather there, and find me a good laptop for the trip"
```
**AI Response:**
- Calls `searchFlights` → Shows FlightCard
- Calls `getWeather` for Tokyo → Shows Weather widget
- Calls `searchProducts` → Shows laptop ProductCards
- Provides integrated travel advice

### Investment Research
```
User: "Show me tech stocks: Apple, Google, and Microsoft. Also find me a good laptop"
```
**AI Response:**
- Multiple `getStockPrice` calls → Shows StockPrice cards
- One `searchProducts` call → Shows ProductCard
- Provides market analysis in text

### Shopping Trip
```
User: "I need running shoes and the weather forecast for tomorrow's run"
```
**AI Response:**
- Calls `searchProducts` for shoes → ProductCards
- Calls `getWeather` → Weather widget
- Suggests based on weather conditions

## 🎨 Visual States

### Loading State
When a tool is called:
```
[Animated skeleton matching final component layout]
```

### Success State
When data is available:
```
[Fully rendered, animated component with real data]
```

### Error State
When something goes wrong:
```
[Error card with friendly message and optional retry action]
```

## 💡 Tips for Best Results

1. **Be Specific**: "Apple stock" works better than "stock"
2. **Use Full Names**: "New York to London" is clearer than "NYC LHR"
3. **Mention Dates**: "December 25th" or "tomorrow" for flights
4. **Combine Requests**: AI can handle multiple tools in one message
5. **Natural Language**: Ask questions naturally, the AI understands context

## 🚫 Current Limitations

- **Mock Data**: Stock prices, flights, and some products use simulated data
- **No Real Transactions**: "Add to Cart" buttons are for demonstration
- **Limited Stock Symbols**: Best results with major companies (AAPL, GOOGL, TSLA, MSFT, AMZN)
- **Simplified Flight Data**: Real flight searches would integrate with airline APIs

## 🔮 Future Enhancements

Ideas for expansion:
- Real-time stock data via API integration
- Actual flight booking through airline partners
- Real e-commerce integration
- Cryptocurrency prices
- Hotel reservations
- Restaurant recommendations with maps
- Calendar event creation
- Interactive data visualizations
