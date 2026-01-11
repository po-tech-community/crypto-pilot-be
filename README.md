# Coin Base - Backend

Backend server for the Coin Base cryptocurrency trading platform built with Node.js, Express, MongoDB, and Socket.io.

## Features

- **Authentication**: JWT-based authentication with secure password hashing (Argon2)
- **Trading Engine**: Market and limit orders with real-time order matching
- **WebSocket**: Real-time price feeds from Binance US for BTC, ETH, BNB, SOL
- **Wallet Management**: Deposits and withdrawals for crypto assets
- **Chat System**: AI-powered chat assistance
- **Balance Tracking**: $100,000 USD starting balance with comprehensive balance validation

## Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (v6 or higher) - running locally or via MongoDB Atlas

## Installation

1. **Navigate to the backend directory:**

   ```bash
   cd coin-base-be
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   Create a `.env` file in the root directory:

   ```bash
   touch .env
   ```

4. **Configure environment variables:**

   Add the following to your `.env` file:

   ```env
   # Server Configuration
   PORT=4000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/coinbase
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coinbase

   # JWT Secret (use a strong random string)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # JWT Expiration
   JWT_EXPIRES_IN=7d

   # Email Configuration (for password reset)
   MAILTRAP_USER=your-mailtrap-user
   MAILTRAP_PASS=your-mailtrap-password
   # Or use Resend:
   # RESEND_API_KEY=your-resend-api-key

   # AI Configuration (optional - for chat feature)
   GOOGLE_API_KEY=your-google-gemini-api-key
   # Or use OpenAI:
   # OPENAI_API_KEY=your-openai-api-key

   # CORS Configuration
   CLIENT_URL=http://localhost:5173
   ```

## Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

The server will start on `http://localhost:4000` with:

- REST API endpoints
- WebSocket server for real-time price feeds
- Auto-restart on file changes

### Production Mode

1. **Build the TypeScript code:**

   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Orders

- `POST /api/orders` - Create new order (market or limit)
- `GET /api/orders` - Get user's orders
- `GET /api/orders/orderbook/:asset` - Get order book for asset
- `DELETE /api/orders/:orderId` - Cancel order
- `GET /api/orders/balance` - Get all balances
- `GET /api/orders/balance/:asset` - Get balance for specific asset

### Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/portfolio` - Get portfolio with holdings

### Wallet

- `POST /api/deposits` - Create deposit
- `GET /api/deposits` - Get deposits
- `POST /api/withdraws` - Create withdrawal
- `GET /api/withdraws` - Get withdrawals

### Chat

- `POST /api/chat` - Send chat message to AI assistant

## WebSocket Events

Connect to `ws://localhost:4000`:

- **Client → Server:**

  - `connection` - Establish connection

- **Server → Client:**
  - `priceUpdate` - Real-time price updates for BTC, ETH, BNB, SOL
  - `orderMatched` - Order execution notification
  - `orderCreated` - New order notification

## Database Structure

### Collections:

- `users` - User accounts and authentication
- `orders` - Trading orders (market & limit)
- `deposits` - Crypto deposits
- `withdrawals` - Crypto withdrawals
- `countries` - Country data for user profiles

## Testing API

You can test the API using:

1. **cURL:**

   ```bash
   # Health check
   curl http://localhost:4000/health

   # Signup
   curl -X POST http://localhost:4000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

2. **Postman/Thunder Client**: Import the API documentation from `docs/` folder

3. **Frontend**: Start the frontend application (see coin-base-fe/README.md)

## Project Structure

```
coin-base-be/
├── src/
│   ├── modules/
│   │   ├── authentication/     # Auth logic
│   │   ├── order/              # Trading engine
│   │   ├── deposit/            # Deposit management
│   │   ├── withdraw/           # Withdrawal management
│   │   ├── profile/            # User profiles
│   │   ├── chat/               # AI chat
│   │   └── country/            # Country data
│   ├── utils/                  # Utilities
│   ├── websocket/              # WebSocket handlers
│   ├── server.ts               # Express app setup
│   └── index.ts                # Entry point
├── docs/                       # API documentation
├── .env                        # Environment variables
└── package.json
```

## Security Notes

- Always use HTTPS in production
- Change the `JWT_SECRET` to a strong random string
- Keep your `.env` file secret (never commit it)
- Use MongoDB Atlas with authentication in production
- Enable CORS only for trusted domains in production

## Troubleshooting

**MongoDB Connection Error:**

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

- Ensure MongoDB is running: `mongod` or start MongoDB service
- Check your `MONGODB_URI` in `.env`

**Port Already in Use:**

```
Error: listen EADDRINUSE: address already in use :::4000
```

- Kill the process: `lsof -ti:4000 | xargs kill -9`
- Or change the PORT in `.env`

**WebSocket Connection Failed:**

- Check firewall settings
- Ensure frontend is connecting to correct URL
- Verify CORS configuration

## Additional Documentation

See the `docs/` folder for detailed API documentation:

- `AUTHENTICATION.md` - Auth endpoints
- `ORDER.md` - Trading endpoints
- `DEPOSIT_WITHDRAW.md` - Wallet endpoints
- `CHAT.md` - Chat endpoints
- `PROFILE.md` - Profile endpoints

## Current Limitations

### Security & Authentication

- **No Rate Limiting**: API endpoints lack rate limiting protection against abuse
- **No 2FA/MFA**: Two-factor authentication not implemented
- **No Password Reset Flow**: Email verification and password reset incomplete
- **No Session Management**: Cannot view/revoke active sessions
- **JWT in localStorage**: Vulnerable to XSS attacks (should use httpOnly cookies)

### Trading & Orders

- **No Order Expiration**: Limit orders stay open indefinitely
- **No Stop-Loss/Take-Profit**: Advanced order types not implemented
- **No Partial Cancellation**: Cannot partially cancel orders
- **No Order Priority**: Orders matched by time only, no price-time priority algorithm
- **Simulated Deposits**: Deposit watcher uses fake transaction hashes for demo
- **No Slippage Protection**: Market orders don't account for slippage
- **Fixed Starting Balance**: All users get $100,000 USD (unrealistic for production)

### Data & Performance

- **No Historical Data**: Price change calculations not implemented (hardcoded 0)
- **No Pagination**: All queries return full datasets (performance issue with scale)
- **No Caching**: Redis/caching layer not implemented
- **No Database Indexing Strategy**: Queries may be slow with large datasets
- **No Query Optimization**: N+1 query problems in some endpoints

### Monitoring & Operations

- **No Logging System**: No structured logging (Winston, Pino, etc.)
- **No Error Tracking**: No Sentry or error monitoring integration
- **No Health Checks**: No /health endpoint with dependency checks
- **No Metrics/Analytics**: No Prometheus, Grafana, or similar
- **No Request Tracing**: No distributed tracing for debugging

### Testing & Quality

- **No Unit Tests**: Zero test coverage
- **No Integration Tests**: API endpoints not tested
- **No Load Testing**: Performance under load unknown
- **No CI/CD Pipeline**: No automated testing or deployment

### Blockchain Integration

- **Simulated Blockchain**: Not connected to real blockchain networks
- **No Real Wallet Generation**: Deposit addresses are placeholders
- **No Transaction Verification**: Cannot verify real blockchain transactions
- **No Gas Fee Calculation**: Withdrawal fees not calculated from network

### Data Validation

- **Weak Input Validation**: Some endpoints lack comprehensive validation
- **No Request Size Limits**: Vulnerable to large payload attacks
- **No SQL Injection Protection**: While Mongoose helps, additional validation needed

## Future Improvements / Roadmap

### Phase 1: Security & Stability (High Priority)

1. **Implement Rate Limiting**

   - Add express-rate-limit middleware
   - Configure per-endpoint rate limits
   - Add IP-based throttling

2. **Add Comprehensive Testing**

   - Unit tests with Jest (target 80% coverage)
   - Integration tests for all API endpoints
   - E2E tests for critical flows

3. **Implement Proper Logging**

   - Add Winston or Pino for structured logging
   - Log all errors with stack traces
   - Add request/response logging

4. **Add Input Validation Layer**

   - Use Joi or Zod for schema validation
   - Validate all request bodies, params, queries
   - Add request size limits

5. **Implement Error Monitoring**
   - Integrate Sentry for error tracking
   - Add error alerting
   - Track error rates and patterns

### Phase 2: Trading Features (Medium Priority)

6. **Advanced Order Types**

   - Stop-loss orders
   - Take-profit orders
   - OCO (One-Cancels-Other) orders
   - Trailing stop orders

7. **Order Management Improvements**

   - Order expiration (time-in-force: GTD, IOC, FOK)
   - Partial order cancellation
   - Order modification (price/amount)
   - Better price-time priority algorithm

8. **Historical Data & Analytics**

   - Store historical price data
   - Calculate real 24h price changes
   - Add candlestick/OHLCV data
   - Portfolio performance tracking

9. **Slippage & Price Protection**
   - Add max slippage parameter for market orders
   - Price deviation warnings
   - Better order book depth calculation

### Phase 3: Performance & Scalability (Medium Priority)

10. **Add Caching Layer**

    - Implement Redis for frequently accessed data
    - Cache order books, balances, prices
    - Add cache invalidation strategy

11. **Database Optimization**

    - Add proper indexes on frequent queries
    - Implement pagination for all list endpoints
    - Optimize N+1 queries
    - Add database read replicas

12. **Add Pagination**
    - Implement cursor-based pagination
    - Add page size limits
    - Return total count in responses

### Phase 4: Production Readiness (High Priority)

13. **Health Monitoring**

    - Add /health endpoint with dependency checks
    - Monitor database connectivity
    - Check WebSocket server status
    - Implement graceful shutdown

14. **Metrics & Observability**

    - Add Prometheus metrics
    - Track API latency, error rates
    - Monitor order matching performance
    - Set up Grafana dashboards

15. **CI/CD Pipeline**
    - Set up GitHub Actions or GitLab CI
    - Automated testing on PR
    - Automated deployment to staging/production
    - Docker containerization

### Phase 5: Enhanced Features (Low Priority)

16. **Real Blockchain Integration**

    - Connect to Bitcoin, Ethereum testnets
    - Real wallet generation (BIP39/44)
    - Verify actual blockchain transactions
    - Calculate real network fees

17. **Advanced Authentication**

    - Two-factor authentication (TOTP)
    - Biometric authentication support
    - OAuth/SSO integration
    - Session management UI

18. **Email & Notifications**

    - Complete email verification flow
    - Password reset functionality
    - Order execution notifications
    - Price alerts
    - Withdrawal confirmations

19. **Admin Dashboard**

    - User management interface
    - Order monitoring tools
    - System health dashboard
    - Transaction review tools

20. **API Documentation**
    - Generate OpenAPI/Swagger docs
    - Interactive API explorer
    - Code examples in multiple languages
    - Webhook documentation

### Phase 6: Advanced Trading (Low Priority)

21. **Margin Trading**

    - Leverage trading support
    - Liquidation engine
    - Collateral management

22. **Advanced Charts**

    - Technical indicators
    - Drawing tools
    - Multiple timeframes
    - Custom indicators

23. **Social Features**

    - Copy trading
    - Trading signals
    - Leaderboards
    - Community features

24. **Mobile API Optimization**
    - Lightweight endpoints for mobile
    - Push notification support
    - Offline mode support
