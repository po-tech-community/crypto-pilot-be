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
