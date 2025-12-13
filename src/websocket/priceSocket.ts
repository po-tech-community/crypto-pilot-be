import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import WebSocket from "ws";
import dotenv from "dotenv";
dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL!;
const BINANCE_WS = process.env.BINANCE_WS!;

interface Prices {
  BTC: string;
  ETH: string;
  XRP: string;
  SOL: string;
}

const prices: Prices = {
  BTC: "0",
  ETH: "0",
  XRP: "0",
  SOL: "0",
};

// Mapping symbol -> prices key
const SYMBOL_MAP: Record<string, keyof Prices> = {
  BTCUSD: "BTC",
  ETHUSD: "ETH",
  XRPUSD: "XRP",
  SOLUSD: "SOL",
};

// Decimal precision for each coin
const PRECISION_MAP: Record<keyof Prices, number> = {
  BTC: 2,
  ETH: 2,
  XRP: 4,
  SOL: 2,
};

export function setupPriceSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: { origin: FRONTEND_URL },
  });

  console.log("WebSocket server started");

  const binanceWS = new WebSocket(BINANCE_WS);

  binanceWS.on("open", () => {
    console.log("Connected to Binance US");
  });

  binanceWS.on("message", (data: Buffer) => {
    try {
      const ticker = JSON.parse(data.toString());
      const key = SYMBOL_MAP[ticker.s];
      if (key) {
        const precision = PRECISION_MAP[key];
        prices[key] = parseFloat(ticker.c).toFixed(precision);
        io.emit("priceUpdate", prices);
        // console.log(prices);
      }
    } catch (err) {
      console.error("Failed to parse message:", err);
    }
  });

  binanceWS.on("error", (err) => {
    console.error("Binance WS error:", err.message);
  });

  binanceWS.on("close", () => {
    console.log("WebSocket closed. Reconnecting in 5s...");
    setTimeout(() => setupPriceSocket(server), 5000);
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.emit("priceUpdate", prices);
  });

  return io;
}
