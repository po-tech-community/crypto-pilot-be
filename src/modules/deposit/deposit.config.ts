export type ChainConfig = {
  requiredConfirmations: number;
  estimatedBlockTimeSec: number;
};

export const CHAIN_CONFIG: Record<string, ChainConfig> = {
  bitcoin: {
    requiredConfirmations: 2,
    estimatedBlockTimeSec: 600,
  },
  ethereum: {
    requiredConfirmations: 12,
    estimatedBlockTimeSec: 12,
  },
  bsc: {
    requiredConfirmations: 15,
    estimatedBlockTimeSec: 3,
  },
  tron: {
    requiredConfirmations: 20,
    estimatedBlockTimeSec: 3,
  },
};
