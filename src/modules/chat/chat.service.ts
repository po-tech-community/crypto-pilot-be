import OpenAI from "openai";
import { depositModel } from "../deposit/deposit.model";
import Withdraw from "../withdraw/withdraw.model";
import {
  Prices,
  NumericPrices,
  CoinSymbol,
  SUPPORTED_COINS,
  COIN_NAMES,
} from "../constantAssets/asset.model";

// Current crypto prices (updated by WebSocket)
let currentPrices: NumericPrices = {
  BTC: 89000,
  ETH: 3000,
  BNB: 2.0,
  SOL: 130,
};

// Update prices when WebSocket receives new data
export function updatePrices(prices: Prices): void {
  currentPrices = {
    BTC: parseFloat(prices.BTC),
    ETH: parseFloat(prices.ETH),
    BNB: parseFloat(prices.BNB),
    SOL: parseFloat(prices.SOL),
  };
}

// User's portfolio summary
interface UserSummary {
  usdBalance: number;
  cryptoHoldings: {
    BTC: number;
    ETH: number;
    BNB: number;
    SOL: number;
  };
  totalValue: number;
  totalDeposited: number;
  totalWithdrawn: number;
  hasActivity: boolean;
}

// Holdings tracker
interface Holdings {
  USD: number;
  BTC: number;
  ETH: number;
  BNB: number;
  SOL: number;
}

// Create empty holdings object
function createEmptyHoldings(): Holdings {
  return { USD: 0, BTC: 0, ETH: 0, BNB: 0, SOL: 0 };
}

// Add a deposit to holdings and return its USD value
function addDeposit(holdings: Holdings, asset: string, amount: number): number {
  const upperAsset = asset.toUpperCase();

  // Handle USD deposits
  if (upperAsset === "USD" || upperAsset === "USDT") {
    holdings.USD += amount;
    return amount;
  }

  // Handle crypto deposits
  if (SUPPORTED_COINS.includes(upperAsset as CoinSymbol)) {
    const coin = upperAsset as CoinSymbol;
    holdings[coin] += amount;
    return amount * currentPrices[coin];
  }

  return 0;
}

// Subtract a withdrawal from holdings and return its USD value
function subtractWithdrawal(
  holdings: Holdings,
  asset: string,
  amount: number
): number {
  const upperAsset = asset.toUpperCase();

  // Handle USD withdrawals
  if (upperAsset === "USD" || upperAsset === "USDT") {
    holdings.USD -= amount;
    return amount;
  }

  // Handle crypto withdrawals
  if (SUPPORTED_COINS.includes(upperAsset as CoinSymbol)) {
    const coin = upperAsset as CoinSymbol;
    holdings[coin] -= amount;
    return amount * currentPrices[coin];
  }

  return 0;
}

// Calculate total value of all crypto holdings in USD
function calculateCryptoValue(holdings: Holdings): number {
  let total = 0;

  for (const coin of SUPPORTED_COINS) {
    total += holdings[coin] * currentPrices[coin];
  }

  return total;
}

// Format a single coin holding for display
function formatCoinHolding(coin: CoinSymbol, amount: number): string {
  const decimals = coin === "BNB" ? 2 : 6;
  const usdValue = amount * currentPrices[coin];
  return `- ${COIN_NAMES[coin]}: ${amount.toFixed(
    decimals
  )} ${coin} ($${usdValue.toFixed(2)})`;
}

// Format current prices for AI prompt
function formatCurrentPrices(): string {
  const priceLines: string[] = [];

  for (const coin of SUPPORTED_COINS) {
    const price = currentPrices[coin].toLocaleString();
    priceLines.push(`- ${coin}: $${price}`);
  }

  return priceLines.join("\n");
}

// Get user's complete portfolio summary
async function getUserSummary(userId: string): Promise<UserSummary | null> {
  try {
    const holdings = createEmptyHoldings();
    let totalDeposited = 0;
    let totalWithdrawn = 0;

    // Get all completed deposits
    const deposits = await depositModel.findMany({
      userId,
      status: "COMPLETED",
    });

    // Add each deposit to holdings
    for (const deposit of deposits) {
      const amount = parseFloat(deposit.amount);
      const usdValue = addDeposit(holdings, deposit.asset, amount);
      totalDeposited += usdValue;
    }

    // Get all completed withdrawals
    const withdrawals = await Withdraw.find({
      userId,
      status: "COMPLETED",
    }).lean();

    // Subtract each withdrawal from holdings
    for (const withdrawal of withdrawals) {
      const amount = parseFloat(withdrawal.amount);
      const usdValue = subtractWithdrawal(holdings, withdrawal.asset, amount);
      totalWithdrawn += usdValue;
    }

    // Calculate totals
    const cryptoValue = calculateCryptoValue(holdings);
    const totalValue = holdings.USD + cryptoValue;
    const hasActivity = deposits.length > 0 || withdrawals.length > 0;

    return {
      usdBalance: holdings.USD,
      cryptoHoldings: {
        BTC: holdings.BTC,
        ETH: holdings.ETH,
        BNB: holdings.BNB,
        SOL: holdings.SOL,
      },
      totalValue,
      totalDeposited,
      totalWithdrawn,
      hasActivity,
    };
  } catch (error) {
    console.error("Error getting user portfolio:", error);
    return null;
  }
}

// Build portfolio section for AI prompt
function buildPortfolioText(summary: UserSummary): string {
  const lines: string[] = [];

  lines.push("USER'S PORTFOLIO:");
  lines.push(`- Cash: $${summary.usdBalance.toFixed(2)}`);

  // Add each coin they own
  for (const coin of SUPPORTED_COINS) {
    const amount = summary.cryptoHoldings[coin];
    if (amount > 0) {
      lines.push(formatCoinHolding(coin, amount));
    }
  }

  lines.push(`- Total Portfolio Value: $${summary.totalValue.toFixed(2)}`);
  lines.push(`- Total Deposited: $${summary.totalDeposited.toFixed(2)}`);

  return lines.join("\n");
}

// Build complete system prompt for AI
function buildSystemPrompt(summary: UserSummary | null): string {
  // Default message for new users
  let portfolioSection = "User is new and hasn't deposited any funds yet.";

  // Build detailed portfolio if user has activity
  if (summary && summary.hasActivity) {
    portfolioSection = buildPortfolioText(summary);
  }

  const pricesSection = formatCurrentPrices();

  return `You are CryptoPilot AI, a friendly crypto trading assistant for a PAPER TRADING platform.

${portfolioSection}

CURRENT LIVE PRICES:
${pricesSection}

YOUR ROLE:
- Help users learn about cryptocurrency trading
- Provide educational information about crypto
- Give general guidance based on their portfolio
- Answer questions about trading concepts

IMPORTANT RULES:
- NEVER give specific buy/sell recommendations
- Always remind users this is PAPER TRADING (fake money for learning)
- Keep responses SHORT (2-4 sentences maximum)
- Be friendly, encouraging, and educational
- If asked about unsupported coins, say "We only support BTC, ETH, BNB, and SOL"

EXAMPLES:
- "Bitcoin (BTC) is currently at $89,280. It's the first cryptocurrency and is often called 'digital gold'. On CryptoPilot, you can practice trading it risk-free!"
- "I see you have $10,000 deposited! Try buying some BTC or ETH to start practicing trading."
- "Great question! A limit order lets you set a specific price. It only executes when the market reaches your price."`;
}

// Initialize OpenAI client
function initializeOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  return new OpenAI({ apiKey });
}

// Call OpenAI API to get chat response
async function callOpenAI(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const openai = initializeOpenAI();

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    max_tokens: 150,
    temperature: 0.7,
  });

  const reply = completion.choices[0].message.content;
  return reply || "Sorry, I couldn't generate a response. Please try again.";
}

// Main function: Get AI chat response for user's message
export async function getChatResponse(
  userMessage: string,
  userId: string
): Promise<string> {
  try {
    // Get user's portfolio from database
    const summary = await getUserSummary(userId);

    // Build AI prompt with portfolio context
    const systemPrompt = buildSystemPrompt(summary);

    // Call OpenAI and get response
    const reply = await callOpenAI(systemPrompt, userMessage);

    return reply;
  } catch (error: any) {
    console.error("Chat service error:", error.message);
    throw new Error("Failed to get AI response");
  }
}

// Validate user's message
export function validateMessage(message: string): boolean {
  if (!message || typeof message !== "string") {
    return false;
  }

  const trimmed = message.trim();
  if (trimmed.length === 0 || trimmed.length > 500) {
    return false;
  }

  return true;
}
