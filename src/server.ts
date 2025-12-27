// Setup basic Express server + Routes

import express, { Request, Response } from "express";
import historyRoutes from "./modules/history/history.routes";
import cors from "cors";
import http from "http";
import { setupPriceSocket } from "./websocket/priceSocket";
import { setupOrderSocket } from "./websocket/orderSocket";
import orderRoutes from "./modules/order/order.routes";
import authRoutes from "./modules/authentication/auth.routes";
import cookieParser from "cookie-parser";
import countryRoutes from "./modules/country/country.routes";
import profileRoutes from "./modules/profile/profile.routes";
import { SignUp, SignIn } from "./modules/authentication/auth.controller";
import { AuthMiddleware } from "./modules/authentication/auth.middleware";
import { depositRouter } from "./modules/deposit/deposit.routes";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Public routes
app.post("/api/auth/register", SignUp);
app.post("/api/auth/login", SignIn);

// Routes
app.use("/api/history", historyRoutes);
app.use("/api/auth", AuthMiddleware, authRoutes);
app.use("/api/countries", AuthMiddleware, countryRoutes);
app.use("/api/profile", AuthMiddleware, profileRoutes);
app.use("/api/orders", AuthMiddleware, orderRoutes);
app.use("/api/deposit", AuthMiddleware, depositRouter);
// Health check
app.get("/", (req: Request, res: Response) =>
  res.send("Express TypeScript API with MongoDB Atlas running")
);

setupPriceSocket(server);
setupOrderSocket();

export default server;
