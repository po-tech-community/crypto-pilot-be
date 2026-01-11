# MiniCoinbase API Documentation Index

Welcome to the MiniCoinbase backend documentation! This project is a cryptocurrency exchange backend with real-time features, AI chat support, and comprehensive order matching.

## Documentation Overview

### Core Features

1. **[Authentication](./AUTHENTICATION.md)** - User registration, login, JWT tokens, password reset
2. **[Profile Management](./PROFILE.md)** - User profiles, international phone support, country association
3. **[Order Matching](../ORDER_MATCHING.md)** - Real-time market and limit orders with WebSocket
4. **[Deposits & Withdrawals](./DEPOSIT_WITHDRAW.md)** - Crypto deposits/withdrawals with blockchain monitoring
5. **[AI Chat Support](./CHAT.md)** - Google Gemini AI assistant for crypto queries and portfolio insights
6. **[Transaction History](./HISTORY.md)** - Track all user transactions and activities
7. **[Country Management](./COUNTRY.md)** - Country data for user profiles

### WebSocket Features

- Real-time price updates from Binance
- Order creation/fill/cancel notifications
- Deposit/withdrawal status updates
- Live order book

---

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Create `.env` file:

```bash
# MongoDB
MONGO_URI=mongodb://localhost:27017/coinbase

# JWT Secrets (minimum 32 characters each)
JWT_SECRET_KEY=your-super-secret-key-at-least-32-chars-long
JWT_REFRESH_KEY=your-refresh-secret-key-at-least-32-chars-long
RESET_PASSWORD_SECRET=your-reset-secret-key-at-least-32-chars-long

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# Binance WebSocket (for live prices)
BINANCE_WS=wss://stream.binance.us:9443/stream?streams=btcusdt@ticker/ethusdt@ticker/BNBusdt@ticker/solusdt@ticker

# Google Gemini AI (for chat)
GEMINI_API_KEY=your-gemini-api-key

# Server Port
PORT=4000
```

### 3. Build & Run

```bash
# Development mode (with nodemon)
npm run dev

# Production build
npm run build
npm start
```

### 4. Test Authentication

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'

# Save the token from response
TOKEN="<your-token-here>"

# Test authenticated endpoint
curl -X GET http://localhost:4000/api/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔌 API Base URL

**Development:** `http://localhost:4000`  
**All endpoints prefix:** `/api`

---

## 🔐 Authentication

Most endpoints require authentication via JWT Bearer token:

```bash
Authorization: Bearer <your-jwt-token>
```

Get token by:

1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login`

Token expires in 15 minutes. Use refresh token for renewal:

```bash
POST /api/auth/refresh
{
  "refreshToken": "<your-refresh-token>"
}
```

---

## 📡 WebSocket Connection

### Connect to WebSocket

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});
```

### Available Events

```javascript
// Price updates (real-time from Binance)
socket.on("priceUpdate", (prices) => {
  console.log("BTC:", prices.BTC);
  console.log("ETH:", prices.ETH);
  console.log("SOL:", prices.SOL);
  console.log("BNB:", prices.BNB);
});

// Order events
socket.on("orderCreated", (order) => {
  console.log("New order:", order);
});

socket.on("orderFilled", (order) => {
  console.log("Order filled:", order);
});

socket.on("orderPartialFilled", (order) => {
  console.log("Order partially filled:", order);
});

socket.on("orderCancelled", (order) => {
  console.log("Order cancelled:", order);
});

socket.on("orderUpdated", (order) => {
  console.log("Order updated:", order);
});
```

---

## Quick Examples

### Complete User Flow

```bash
# 1. Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"SecurePass123","confirmPassword":"SecurePass123"}'

# 2. Extract token from response
TOKEN="eyJhbGc..."

# 3. Complete profile
curl -X PUT http://localhost:4000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Alice","lastName":"Smith","phone":"+1-555-123-4567"}'

# 4. Create deposit request
curl -X POST http://localhost:4000/api/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"asset":"BTC","network":"bitcoin","amount":"0.1"}'

# 5. Place a market order
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"asset":"BTC","type":"market","side":"buy","amount":0.05}'

# 6. Place a limit order
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"asset":"BTC","type":"limit","side":"sell","amount":0.05,"limitPrice":45000}'

# 7. Check order book
curl -X GET http://localhost:4000/api/orders/book

# 8. Chat with AI assistant
curl -X POST http://localhost:4000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is my portfolio value?"}'
```

---

## 🗂️ Module Structure

```
src/
├── modules/
│   ├── authentication/    # User auth, JWT, password management
│   ├── profile/          # User profile CRUD
│   ├── order/            # Order matching engine
│   ├── deposit/          # Crypto deposits + watcher
│   ├── withdraw/         # Crypto withdrawals + watcher
│   ├── chat/             # AI assistant
│   ├── history/          # Transaction history
│   ├── country/          # Country data
│   └── constantAssets/   # Asset/price configuration
├── websocket/            # Socket.IO setup
│   ├── priceSocket.ts    # Binance price streaming
│   └── orderSocket.ts    # Order event broadcasting
└── utils/                # Database, errors, email
```

---

## Configuration Reference

### Supported Assets

- **BTC** - Bitcoin
- **ETH** - Ethereum
- **SOL** - Solana
- **BNB** - Ripple

### Supported Networks

- **bitcoin** - Bitcoin mainnet
- **ethereum** - Ethereum mainnet
- **bsc** - Binance Smart Chain
- **solana** - Solana mainnet
- **BNB** - BNB Ledger

### Order Types

- **market** - Execute immediately at current price
- **limit** - Execute only at specified price or better

### Order Sides

- **buy** - Buy asset
- **sell** - Sell asset

### Order Status

- **open** - Awaiting execution
- **filled** - Completely executed
- **cancelled** - Cancelled by user

### Deposit/Withdrawal Status

- **PENDING** - Awaiting confirmations
- **COMPLETED** - Confirmed and processed
- **FAILED** - Transaction failed

---

## 🧪 Testing Tools

### cURL Examples

See individual feature docs for complete cURL examples.

### Postman Collection

Import the API endpoints into Postman:

1. Create new collection
2. Add base URL: `http://localhost:4000`
3. Set environment variable `token` after login
4. Use `{{token}}` in Authorization headers

### WebSocket Testing

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:4000

# You'll receive priceUpdate events automatically
```

### Node.js Test Script

```javascript
// test-api.js
const fetch = require("node-fetch");

const BASE_URL = "http://localhost:4000/api";
let token = "";

async function register() {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `test${Date.now()}@example.com`,
      password: "SecurePass123",
      confirmPassword: "SecurePass123",
    }),
  });
  const data = await res.json();
  token = data.token;
  console.log("Registered, token:", token.substring(0, 20) + "...");
}

async function createOrder() {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      asset: "BTC",
      type: "limit",
      side: "buy",
      amount: 0.1,
      limitPrice: 40000,
    }),
  });
  const data = await res.json();
  console.log("Order created:", data);
}

async function run() {
  await register();
  await createOrder();
}

run();
```

---

## Database Collections

### Users

- Authentication credentials
- User roles (user/admin)
- Refresh tokens

### Profiles

- Personal information
- Country association
- Join date

### Orders

- Market/limit orders
- Order status and matching

### Deposits

- Deposit requests
- Generated addresses
- Transaction tracking

### Withdrawals

- Withdrawal requests
- Destination addresses
- Confirmation tracking

### History

- Transaction logs
- Activity records

### Countries

- Country codes
- Country names

---

## 🚨 Error Handling

All endpoints return errors in consistent format:

```json
{
  "message": "Error description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (auth required/invalid)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Security Features

- Argon2 password hashing
- JWT with short expiry (15min)
- Refresh token rotation
- HTTP-only cookies
- CORS configuration
- Input validation
- SQL injection protection (via Mongoose)
- Rate limiting (should be implemented)

### Recommendations for Production

- [ ] Add rate limiting (express-rate-limit)
- [ ] Implement CAPTCHA
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Add request logging
- [ ] Implement IP whitelisting for admin
- [ ] Add 2FA for withdrawals
- [ ] Monitor failed login attempts
- [ ] Add CSRF protection

---

## Changelog

### v1.1.0 (2024-01-22)

- Added real-time order matching engine
- Improved password validation
- Fixed refresh token expiry
- Enhanced phone number validation
- Improved error messages

### v1.0.0 (2024-01-15)

- Initial release
- Authentication system
- Profile management
- Basic order system
- Deposit/Withdrawal
- AI chat support

---

## 🤝 Contributing

### Code Style

- Use TypeScript
- Follow existing naming conventions
- Add JSDoc comments for functions
- Write tests for new features

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature
```

---

## 📞 Support

For issues or questions:

1. Check the relevant feature documentation
2. Review error messages and logs
3. Verify environment variables
4. Check database connection
5. Ensure all dependencies are installed

---

## 📄 License

Educational project - use for learning purposes.

---

## 🔗 Related Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [JWT.io](https://jwt.io/)
- [Binance API Docs](https://binance-docs.github.io/apidocs/)
