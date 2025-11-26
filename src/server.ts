// Setup basic Express server + Routes

import express, { Request, Response } from "express";
import accountRoutes from "./modules/account/account.routes";

const app = express();

app.use(express.json());

// Routes
app.use("/api/accounts", accountRoutes);

// Health check
app.get("/", (req: Request, res: Response) =>
  res.send("Express TypeScript API with MongoDB Atlas running")
);

export default app;
