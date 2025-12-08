// Setup basic Express server + Routes

import express, { Request, Response } from "express";
import accountRoutes from "./modules/account/account.routes";
import historyRoutes from "./modules/history/history.routes";
import cors from "cors";

const app = express();

app.use(express.json());
// CORS configuration to allow requests from frontend
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
// Routes
app.use("/api/accounts", accountRoutes);
app.use("/api/history", historyRoutes);

// Health check
app.get("/", (req: Request, res: Response) =>
  res.send("Express TypeScript API with MongoDB Atlas running")
);

export default app;
