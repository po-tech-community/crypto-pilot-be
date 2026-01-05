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

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL!;
const BINANCE_WS = process.env.BINANCE_WS!;

const prices: Prices = { ...INITIAL_PRICES };

let io: SocketIOServer;

export function setupPriceSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: { origin: FRONTEND_URL || "*", credentials: true },
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
        updatePrices(prices);
        console.log(prices);
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

export function getSocketIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO not initialized! Call setupPriceSocket first.");
  }
  return io;
}
