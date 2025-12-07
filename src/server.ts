// Setup basic Express server + Routes

import express, { Request, Response } from "express";
import accountRoutes from "./modules/account/account.routes";
import http from "http";
import cors from "cors";
import { setupPriceSocket } from "./websocket/priceSocket";


const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/accounts", accountRoutes);

// Health check
app.get("/", (req: Request, res: Response) =>
  res.send("Express TypeScript API with MongoDB Atlas running")
);

setupPriceSocket(server);

export default server;
