// Setup basic Express server + Routes

import express, { Request, Response } from "express";
import accountRoutes from "./modules/account/account.routes";
import authRoutes from "./modules/authentication/auth.routes"
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Routes
app.use("/api/accounts", accountRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req: Request, res: Response) =>
  res.send("Express TypeScript API with MongoDB Atlas running")
);

export default app;
