// Setup basic Express server + Routes

import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import { setupPriceSocket } from "./websocket/priceSocket";
import orderRoutes from "./modules/order/order.routes";
import authRoutes from "./modules/authentication/auth.routes";
import cookieParser from "cookie-parser";
import countryRoutes from "./modules/country/country.routes";
import profileRoutes from "./modules/profile/profile.routes";
import { SignUp, SignIn } from "./modules/authentication/auth.controller";
import { AuthMiddleware } from "./modules/authentication/auth.middleware";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Public routes
app.use("/api/auth/register", SignUp);
app.use("/api/auth/login", SignIn);

// Routes
app.use("/api/auth", AuthMiddleware, authRoutes);
app.use("/api/countries", AuthMiddleware, countryRoutes);
app.use("/api/profile", AuthMiddleware, profileRoutes);
app.use("/api/orders", AuthMiddleware, orderRoutes);

// Health check
app.get("/", (req: Request, res: Response) =>
  res.send("Express TypeScript API with MongoDB Atlas running")
);

setupPriceSocket(server);

export default server;
