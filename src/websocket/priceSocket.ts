import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import WebSocket from "ws";
import dotenv from "dotenv";
import { updatePrices } from "../modules/chat/chat.service";
import {
  Prices,
  SYMBOL_MAP,
  PRECISION_MAP,
  INITIAL_PRICES,
} from "../modules/constantAssets/asset.model";
import { checkLimitOrders } from "../modules/order/order.matching";

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL!;
const BINANCE_WS =
  process.env.BINANCE_WS ||
  "wss://stream.binance.us:9443/stream?streams=btcusdt@ticker/ethusdt@ticker/bnbusdt@ticker/solusdt@ticker";

const prices: Prices = { ...INITIAL_PRICES };

let io: SocketIOServer;

export function setupPriceSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: { origin: FRONTEND_URL || "*", credentials: true },
  });

  console.log("\n🚀 [BE] WebSocket server started");
  console.log(`📡 [BE] Connecting to Binance: ${BINANCE_WS}`);
  console.log(`🌐 [BE] CORS allowed origin: ${FRONTEND_URL || "*"}\n`);

  const binanceWS = new WebSocket(BINANCE_WS);

  binanceWS.on("open", () => {
    console.log("✅ [BE] Connected to Binance US WebSocket");
    console.log(`📊 [BE] Initial prices: ${JSON.stringify(prices)}\n`);
  });

  binanceWS.on("message", (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      // Handle Binance stream format: {stream: "btcusdt@ticker", data: {...}}
      const ticker = message.data || message;
      const key = SYMBOL_MAP[ticker.s];
      if (key) {
        const precision = PRECISION_MAP[key];
        const newPrice = parseFloat(ticker.c).toFixed(precision);
        const oldPrice = prices[key];
        prices[key] = newPrice;

        console.log(`💰 [BE] ${key} price updated: ${oldPrice} → ${newPrice}`);

        io.emit("priceUpdate", prices);
        console.log(
          `📤 [BE] Emitted priceUpdate to ${io.engine.clientsCount} client(s)`
        );

        updatePrices(prices);

        // Check limit orders when price changes
        if (oldPrice !== newPrice) {
          checkLimitOrders(prices).catch((err) => {
            console.error("❌ [BE] Error checking limit orders:", err);
          });
        }
      } else {
        console.log(`⚠️  [BE] Unknown ticker symbol: ${ticker.s}`);
      }
    } catch (err) {
      console.error("❌ [BE] Failed to parse message:", err);
    }
  });

  binanceWS.on("error", (err) => {
    console.error("❌ [BE] Binance WS error:", err.message);
  });

  binanceWS.on("close", () => {
    console.log("⚠️  [BE] Binance WebSocket closed. Reconnecting in 5s...");
    setTimeout(() => setupPriceSocket(server), 5000);
  });

  io.on("connection", (socket) => {
    console.log(`\n👤 [BE] Client connected: ${socket.id}`);
    console.log(`📊 [BE] Sending initial prices: ${JSON.stringify(prices)}\n`);
    socket.emit("priceUpdate", prices);

    socket.on("disconnect", () => {
      console.log(`👋 [BE] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO not initialized! Call setupPriceSocket first.");
  }
  return io;
}

export function getCurrentPrices(): Prices {
  return { ...prices };
}
