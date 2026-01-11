# AI Chat Assistant Documentation

## Overview

The chat module provides an AI-powered assistant using Google's Gemini AI to help users with cryptocurrency questions, portfolio analysis, and exchange guidance. The assistant has access to user's portfolio data, transaction history, and real-time crypto prices.

## Features

- Context-aware responses
- Portfolio analysis and insights
- Real-time price data integration
- Transaction history analysis
- Cryptocurrency education
- Market trend discussion

---

## API Endpoint

### Chat with AI Assistant

**Endpoint:** `POST /api/chat`  
**Authentication:** Bearer Token (Required)  
**Description:** Send a message to the AI assistant and receive contextual response.

#### Headers

```
Authorization: Bearer <access_token>
```

#### Request Body

```json
{
  "message": "What is my portfolio worth?"
}
```

#### Success Response (200)

```json
{
  "response": "Based on your current holdings and real-time prices:\n\n• BTC: 0.5 @ $45,000 = $22,500\n• ETH: 2.0 @ $3,000 = $6,000\n• Total Portfolio Value: $28,500\n\nYou've deposited $25,000 total, giving you an 14% gain. Great job!"
}
```

#### Error Responses

```json
// 400 - Missing message
{ "message": "Message is required" }

// 401 - Unauthorized
{ "message": "Missing token" }

// 500 - AI error
{ "message": "Failed to get AI response" }
```

#### Test Example

```bash
# Ask about portfolio
curl -X POST http://localhost:4000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is my total portfolio value?"}'

# Ask about crypto
curl -X POST http://localhost:4000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Bitcoin?"}'

# Ask for advice
curl -X POST http://localhost:4000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Should I buy ETH right now?"}'

# Check prices
curl -X POST http://localhost:4000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the current BTC price?"}'
```

---

## AI Capabilities

### 1. Portfolio Analysis

The AI can analyze your complete portfolio with current holdings and values.

**Sample Questions:**

- "What is my portfolio worth?"
- "Show me my crypto holdings"
- "How much have I invested?"
- "What's my profit/loss?"
- "Which crypto do I own the most of?"

**AI Response Includes:**

- Current holdings for each asset
- Current market prices
- Total value per asset
- Overall portfolio value
- Total deposited vs current value
- Profit/loss percentage

### 2. Price Information

Real-time access to current crypto prices from Binance.

**Sample Questions:**

- "What is the current BTC price?"
- "How much is ETH worth?"
- "Show me all crypto prices"
- "What's the price of Solana?"

**Current Prices:**
The AI has access to live prices for BTC, ETH, SOL, and BNB updated via WebSocket.

### 3. Transaction History

Analysis of deposits, withdrawals, and trades.

**Sample Questions:**

- "How many deposits have I made?"
- "What was my largest withdrawal?"
- "Show me my transaction history"
- "How much have I withdrawn?"

### 4. Cryptocurrency Education

General information about cryptocurrencies, blockchain, and trading.

**Sample Questions:**

- "What is Bitcoin?"
- "Explain blockchain technology"
- "What's the difference between market and limit orders?"
- "How do I secure my crypto?"
- "What is a crypto wallet?"

### 5. Platform Guidance

Help with using the MiniCoinbase platform.

**Sample Questions:**

- "How do I deposit crypto?"
- "How do I place an order?"
- "What assets can I trade?"
- "How long do deposits take?"
- "What are the withdrawal fees?"

---

## System Prompt

The AI assistant operates with this context:

```
You are a helpful crypto exchange assistant for "MiniCoinbase."

Current supported assets: BTC, ETH, SOL, BNB

Current live prices:
• BTC: $45,000
• ETH: $3,000
• SOL: $130
• BNB: $2.00

The user's portfolio summary:
• USD Balance: $1,000
• BTC: 0.5 (worth $22,500)
• ETH: 2.0 (worth $6,000)
• SOL: 10 (worth $1,300)
• BNB: 500 (worth $1,000)
• Total Portfolio Value: $31,800
• Total Deposited: $30,000
• Total Withdrawn: $0

When answering questions:
1. Be concise and friendly
2. Use emojis sparingly
3. For portfolio questions, provide exact numbers
4. For general crypto questions, educate briefly
5. Always remind users you can't give financial advice
6. Be helpful about platform features
```

---

## Integration with Other Modules

### Real-Time Price Updates

The chat service receives live price updates from the WebSocket price stream:

```typescript
// priceSocket.ts broadcasts prices
updatePrices(prices); // → chat.service.ts

// AI always has current market prices
const currentPrices = {
  BTC: parseFloat(prices.BTC),
  ETH: parseFloat(prices.ETH),
  BNB: parseFloat(prices.BNB),
  SOL: parseFloat(prices.SOL),
};
```

### Portfolio Calculation

The AI calculates user's portfolio by:

1. Fetching all completed deposits
2. Fetching all completed withdrawals
3. Calculating holdings (deposits - withdrawals)
4. Multiplying by current prices
5. Providing summary with totals

```typescript
Holdings = ∑(Deposits) - ∑(Withdrawals)
Asset Value = Holdings × Current Price
Portfolio Value = ∑(All Asset Values) + USD Balance
Profit/Loss = Portfolio Value - Total Deposited + Total Withdrawn
```

---

## Example Conversations

### Portfolio Query

```
User: "What is my portfolio worth?"

AI: "Based on your current holdings and real-time prices:

💰 Your Portfolio:
• BTC: 0.5 @ $45,000 = $22,500
• ETH: 2.0 @ $3,000 = $6,000
• SOL: 10 @ $130 = $1,300
• BNB: 500 @ $2.00 = $1,000
• USD: $1,000

Total Portfolio Value: $31,800

You've deposited $30,000 and haven't withdrawn anything yet,
giving you a $1,800 gain (6%). Nice work! 📈"
```

### Price Query

```
User: "What's the current Bitcoin price?"

AI: "Bitcoin (BTC) is currently trading at $45,000 USD.

Would you like to:
• Place a market order to buy/sell BTC
• Set a limit order at your target price
• Learn more about Bitcoin

Just let me know how I can help! 😊"
```

### Educational Query

```
User: "What is a limit order?"

AI: "A limit order lets you buy or sell crypto at a specific
price you choose:

- Buy Limit: Execute only if price drops to your limit or lower
- Sell Limit: Execute only if price rises to your limit or higher

Example: If BTC is $45,000 and you set a buy limit at $44,000,
your order will only execute if BTC drops to $44,000 or below.

Use limit orders when you:
- Want to buy dips or sell peaks
- Have a target price in mind
- Don't need immediate execution

Would you like to place a limit order?"
```

### Platform Help

```
User: "How do I deposit crypto?"

AI: "To deposit crypto into MiniCoinbase:

1. Go to Deposit page
2. Select your asset (BTC, ETH, SOL, or BNB)
3. Choose the network
4. We'll generate a unique deposit address
5. Send crypto from your wallet to that address
6. Wait for confirmations:
   • Bitcoin: 6 confirmations (~60 min)
   • Ethereum: 12 confirmations (~3 min)
   • Solana: 32 confirmations (~15 sec)
   • BNB: 1 confirmation (~4 sec)

Your deposit will appear in your balance once confirmed!

Need help with a specific asset?"
```

---

## Testing Examples

### Test Complete Flow

```bash
TOKEN="your-token"
API="http://localhost:4000/api"

# 1. Create some deposits first
curl -X POST $API/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"asset":"BTC","network":"bitcoin","amount":"0.5"}'

# 2. Ask about portfolio (will be empty initially)
curl -X POST $API/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is my portfolio?"}'

# 3. Ask about prices
curl -X POST $API/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Show me all crypto prices"}'

# 4. Ask educational question
curl -X POST $API/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is Ethereum?"}'

# 5. Ask for help
curl -X POST $API/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I place a market order?"}'
```

### Test Portfolio With Actual Data

```bash
# After completing deposits (status=COMPLETED), ask:
curl -X POST http://localhost:4000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Give me a detailed portfolio analysis"}'

# Expected response includes:
# - Each asset holding
# - Current market prices
# - Value per asset
# - Total portfolio value
# - Profit/loss analysis
```

---

## Frontend Integration

### React Chat Component

```typescript
import { useState } from "react";

function ChatAssistant() {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      // Add AI response
      const aiMsg = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && <div className="loading">AI is thinking...</div>}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything about crypto..."
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
```

---

## AI Configuration

### Environment Variable

```bash
# Required: Google Gemini API Key
GEMINI_API_KEY=your-api-key-here
```

Get your API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Add to `.env` file

### Model Configuration

```typescript
// Current model: gemini-1.5-flash
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
```

---

## Limitations

### Current Limitations

- No conversation history (stateless per request)
- No memory of previous messages
- Portfolio data based on completed deposits/withdrawals only
- No prediction or financial advice
- English language only

### Future Enhancements

- [ ] Conversation history/context
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Chart generation
- [ ] Price alerts setup via chat
- [ ] Order placement via chat
- [ ] Advanced portfolio analytics
- [ ] Custom report generation

---

## Best Practices

### For Users

1. **Be specific** - "What is my BTC holding?" vs "crypto?"
2. **Ask follow-ups** - Each response is independent, but you can ask related questions
3. **Use for learning** - Great for understanding crypto concepts
4. **Check facts** - AI provides info but always verify important details

### For Developers

1. **Rate limit** - Implement rate limiting on chat endpoint
2. **Token costs** - Monitor API usage and costs
3. **Error handling** - Gracefully handle AI service outages
4. **Context size** - Keep portfolio summaries concise
5. **Security** - Never expose sensitive data in prompts

---

## Troubleshooting

### "Failed to get AI response"

- Check `GEMINI_API_KEY` is set in `.env`
- Verify API key is valid (test at Google AI Studio)
- Check internet connection
- Review server logs for specific error

### Empty portfolio in responses

- Ensure user has completed deposits (status=COMPLETED)
- Check deposit watcher is running
- Verify deposits are in database
- Review portfolio calculation logic

### Inaccurate prices in responses

- Verify Binance WebSocket is connected
- Check price update mechanism
- Review `currentPrices` in chat service

### Slow responses

- Normal: Gemini API can take 2-5 seconds
- Check network latency
- Consider caching common questions
- Monitor API quotas

---

## Security Considerations

### Data Privacy

- ✅ User portfolio data only accessible via authenticated requests
- ✅ AI prompts include user-specific data securely
- ✅ No storage of conversation history
- ⚠️ Be careful not to log sensitive data

### API Key Security

- ✅ Store in environment variable
- ✅ Never commit to git
- ⚠️ Rotate keys regularly
- ⚠️ Monitor usage for anomalies

---

## Performance

### Response Time

- Average: 2-5 seconds
- Factors: AI processing, portfolio calculation, network latency

### Optimization Tips

```typescript
// Cache portfolio calculation
const portfolioCache = new Map();
const CACHE_TTL = 60000; // 1 minute

async function getCachedPortfolio(userId: string) {
  const cached = portfolioCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const fresh = await calculatePortfolio(userId);
  portfolioCache.set(userId, { data: fresh, timestamp: Date.now() });
  return fresh;
}
```

---

## Testing Checklist

- [ ] Simple question (e.g., "Hello")
- [ ] Portfolio query with no deposits
- [ ] Portfolio query with completed deposits
- [ ] Price inquiry
- [ ] Educational question
- [ ] Platform help question
- [ ] Multi-asset portfolio
- [ ] Error handling (invalid token)
- [ ] Long/complex question
- [ ] Rapid successive messages

---

## Example Responses Dataset

For testing, here are expected question types and response patterns:

| Question Type | Example            | Expected Response               |
| ------------- | ------------------ | ------------------------------- |
| Portfolio     | "My holdings?"     | Detailed asset breakdown        |
| Price         | "BTC price?"       | Current BTC price + context     |
| Educational   | "What is staking?" | Explanation of concept          |
| Platform      | "How to withdraw?" | Step-by-step guide              |
| General       | "Hello"            | Friendly greeting + offers help |
| Advice        | "Should I buy?"    | Disclaimer + educational info   |
