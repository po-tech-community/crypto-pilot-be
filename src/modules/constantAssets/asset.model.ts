export type NetworkKey =
  | "bitcoin"
  | "ethereum"
  | "bsc"
  | "xrp"
  | "solana";

export type NetworkConfig = {
  key: NetworkKey;
  label: string;
  addressFormat: "btc" | "evm" | "xrp" | "solana";
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
  xrp: {
    key: "xrp",
    label: "XRP Ledger",
    addressFormat: "xrp",
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
    symbol: "XRP",
    name: "Ripple",
    minDeposit: "10",
    networks: ["xrp"],
  },
  {
    symbol: "SOL",
    name: "Solana",
    minDeposit: "0.01",
    networks: ["solana"],
  },
];

export type CoinSymbol = "BTC" | "ETH" | "XRP" | "SOL";

export interface Prices {
  BTC: string;
  ETH: string;
  XRP: string;
  SOL: string;
}

export interface NumericPrices {
  BTC: number;
  ETH: number;
  XRP: number;
  SOL: number;
}

export const SYMBOL_MAP: Record<string, CoinSymbol> = {
  BTCUSDT: "BTC",
  ETHUSDT: "ETH",
  XRPUSDT: "XRP",
  SOLUSDT: "SOL",
};

export const PRECISION_MAP: Record<CoinSymbol, number> = {
  BTC: 2,
  ETH: 2,
  XRP: 4,
  SOL: 2,
};

export const INITIAL_PRICES: Prices = {
  BTC: "0",
  ETH: "0",
  XRP: "0",
  SOL: "0",
};

export const SUPPORTED_COINS: CoinSymbol[] = ["BTC", "ETH", "XRP", "SOL"];

export const COIN_NAMES: Record<CoinSymbol, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  XRP: "Ripple",
  SOL: "Solana",
};