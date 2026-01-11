import { Request, Response } from "express";
import { AuthRequest } from "../authentication/auth.types";
import { getCurrentPrices } from "../../websocket/priceSocket";
import Order from "../order/order.model";
import { CoinSymbol } from "../constantAssets/asset.model";

interface PortfolioAsset {
  symbol: CoinSymbol;
  name: string;
  balance: number;
  currentPrice: number;
  value: number;
  change24h: number;
}

export const getPortfolio = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get current prices
    const prices = getCurrentPrices();

    // Get all filled buy orders for this user
    const orders = await Order.find({
      userId,
      status: "filled",
    }).sort({ createdAt: -1 });

    // Calculate balance for each coin
    const balances: Record<string, number> = {
      BTC: 0,
      ETH: 0,
      BNB: 0,
      SOL: 0,
    };

    for (const order of orders) {
      const amount = Number(order.amount);
      if (order.side === "buy") {
        balances[order.asset] = (balances[order.asset] || 0) + amount;
      } else if (order.side === "sell") {
        balances[order.asset] = (balances[order.asset] || 0) - amount;
      }
    }

    // Build portfolio response
    const portfolio: PortfolioAsset[] = [];
    let totalValue = 0;

    const coinNames: Record<CoinSymbol, string> = {
      BTC: "Bitcoin",
      ETH: "Ethereum",
      BNB: "BNB",
      SOL: "Solana",
    };

    for (const [symbol, balance] of Object.entries(balances)) {
      if (balance > 0) {
        const price = Number(prices[symbol as CoinSymbol]) || 0;
        const value = balance * price;
        totalValue += value;

        portfolio.push({
          symbol: symbol as CoinSymbol,
          name: coinNames[symbol as CoinSymbol],
          balance,
          currentPrice: price,
          value,
          change24h: 0, // TODO: Calculate from historical data
        });
      }
    }

    return res.status(200).json({
      portfolio,
      totalValue,
      totalAssets: portfolio.length,
    });
  } catch (error) {
    console.error("Error getting portfolio:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
