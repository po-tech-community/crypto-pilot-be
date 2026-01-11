import { Response } from "express";
import { AuthRequest } from "../authentication/auth.types";
import {
  getUserBalance,
  getUserUSDBalance,
  getReservedBalance,
  getReservedUSDBalance,
} from "./order.balance";

/**
 * GET /api/orders/balance
 * Get user's available and reserved balances for all assets
 */
export const getBalances = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const assets = ["BTC", "ETH", "SOL", "BNB"];
    const balances: any = {};

    // Get USD balance
    const usdBalance = await getUserUSDBalance(userId);
    const usdReserved = await getReservedUSDBalance(userId);
    balances.USD = {
      total: usdBalance,
      available: usdBalance - usdReserved,
      reserved: usdReserved,
    };

    // Get crypto balances
    for (const asset of assets) {
      const balance = await getUserBalance(userId, asset);
      const reserved = await getReservedBalance(userId, asset);
      balances[asset] = {
        total: balance,
        available: balance - reserved,
        reserved: reserved,
      };
    }

    return res.status(200).json({ balances });
  } catch (err: any) {
    console.error("Error getting balances:", err);
    return res.status(500).json({ message: "Failed to get balances" });
  }
};

/**
 * GET /api/orders/balance/:asset
 * Get user's balance for a specific asset
 */
export const getAssetBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const asset = req.params.asset.toUpperCase();

    let balance: number;
    let reserved: number;

    if (asset === "USD") {
      balance = await getUserUSDBalance(userId);
      reserved = await getReservedUSDBalance(userId);
    } else if (["BTC", "ETH", "SOL", "BNB"].includes(asset)) {
      balance = await getUserBalance(userId, asset);
      reserved = await getReservedBalance(userId, asset);
    } else {
      return res.status(400).json({ message: "Invalid asset" });
    }

    return res.status(200).json({
      asset,
      total: balance,
      available: balance - reserved,
      reserved: reserved,
    });
  } catch (err: any) {
    console.error("Error getting asset balance:", err);
    return res.status(500).json({ message: "Failed to get asset balance" });
  }
};
