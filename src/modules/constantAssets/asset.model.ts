export type NetworkKey = "bitcoin" | "ethereum" | "bsc" | "BNB" | "solana";

export type NetworkConfig = {
  key: NetworkKey;
  label: string;
  addressFormat: "btc" | "evm" | "BNB" | "solana";
  requiredConfirmations: number;
  estimatedBlockTimeSec: number;
};

export const Network: Record<NetworkKey, NetworkConfig> = {
  bitcoin: {
    key: "bitcoin",
    label: "Bitcoin",
    addressFormat: "btc",
    requiredConfirmations: 2,
    estimatedBlockTimeSec: 600,
  },
  ethereum: {
    key: "ethereum",
    label: "Ethereum (ERC20)",
    addressFormat: "evm",
    requiredConfirmations: 12,
    estimatedBlockTimeSec: 12,
  },
  bsc: {
    key: "bsc",
    label: "BNB Smart Chain",
    addressFormat: "evm",
    requiredConfirmations: 15,
    estimatedBlockTimeSec: 3,
  },
  BNB: {
    key: "BNB",
    label: "BNB Ledger",
    addressFormat: "BNB",
    requiredConfirmations: 1,
    estimatedBlockTimeSec: 4,
  },
  solana: {
    key: "solana",
    label: "Solana",
    addressFormat: "solana",
    requiredConfirmations: 32,
    estimatedBlockTimeSec: 0.4,
  },
};

export type Asset = {
  symbol: string;
  name: string;
  minDeposit: string;
  networks: NetworkKey[];
};

export const ASSETS: Asset[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    minDeposit: "0.0001",
    networks: ["bitcoin"],
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    minDeposit: "0.001",
    networks: ["ethereum"],
  },
  {
    symbol: "BNB",
    name: "Ripple",
    minDeposit: "10",
    networks: ["BNB"],
  },
  {
    symbol: "SOL",
    name: "Solana",
    minDeposit: "0.01",
    networks: ["solana"],
  },
];

export type CoinSymbol = "BTC" | "ETH" | "BNB" | "SOL";

export interface Prices {
  BTC: string;
  ETH: string;
  BNB: string;
  SOL: string;
}

export interface NumericPrices {
  BTC: number;
  ETH: number;
  BNB: number;
  SOL: number;
}

export const SYMBOL_MAP: Record<string, CoinSymbol> = {
  // Binance US uses USD suffix
  BTCUSD: "BTC",
  ETHUSD: "ETH",
  BNBUSD: "BNB",
  SOLUSD: "SOL",
  // Binance International uses USDT suffix
  BTCUSDT: "BTC",
  ETHUSDT: "ETH",
  BNBUSDT: "BNB",
  SOLUSDT: "SOL",
};

export const PRECISION_MAP: Record<CoinSymbol, number> = {
  BTC: 2,
  ETH: 2,
  BNB: 2,
  SOL: 2,
};

export const INITIAL_PRICES: Prices = {
  BTC: "95000.00",
  ETH: "3400.00",
  BNB: "650.00",
  SOL: "185.00",
};

export const SUPPORTED_COINS: CoinSymbol[] = ["BTC", "ETH", "BNB", "SOL"];

export const COIN_NAMES: Record<CoinSymbol, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  BNB: "BNB",
  SOL: "Solana",
};
