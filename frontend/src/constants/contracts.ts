import type { Address } from "viem";
import ABI from "./PredictionMarket.abi.json";

export const PREDICTION_MARKET_ADDRESS: Address =
  "0x443BF6b3e453E8e6982D5048386800bD61cc3451";

export const PREDICTION_MARKET_ABI = ABI;

// Chain configuration
export const SEPOLIA_CHAIN_ID = 11155111;

// Contract constants
export const SHARE_PRICE = BigInt("10000000000000"); // 0.00001 ETH
export const MIN_SHARES = 1n;
export const MAX_SHARES = 1000000n;
