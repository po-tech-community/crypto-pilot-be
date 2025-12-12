// Setup basic Express server + Routes

import express, { Request, Response } from "express";
import accountRoutes from "./modules/account/account.routes";
import http from "http";
import cors from "cors";
import { setupPriceSocket } from "./websocket/priceSocket";
import orderRoutes from "./modules/order/order.routes";
import authRoutes from "./modules/authentication/auth.routes"
import cookieParser from "cookie-parser";
import countryRoutes from "./modules/country/country.routes";
import profileRoutes from "./modules/profile/profile.routes";



const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));


// Routes
app.use("/api/accounts", accountRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/orders", orderRoutes);

// Health check
app.get("/", (req: Request, res: Response) =>
  res.send("Express TypeScript API with MongoDB Atlas running")
);

setupPriceSocket(server);

export default server;
