import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Test helper functions for PredictionMarket tests
 */

export const SHARE_PRICE = ethers.parseEther("0.00001");
export const MIN_DURATION = 10 * 60; // 10 minutes
export const MAX_DURATION = 30 * 24 * 60 * 60; // 30 days

export interface MarketParams {
  marketId: string;
  question: string;
  outcomes: string[];
  duration: number;
}

export const DEFAULT_MARKET_PARAMS: MarketParams = {
  marketId: "test-market-1",
  question: "Will BTC reach $100k by end of year?",
  outcomes: ["Yes", "No"],
  duration: MIN_DURATION,
};

/**
 * Deploy a fresh PredictionMarket contract
 */
export async function deployPredictionMarket() {
  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy();
  await predictionMarket.waitForDeployment();
  return predictionMarket;
}

/**
 * Create a market with default or custom parameters
 */
export async function createMarket(
  contract: any,
  params: Partial<MarketParams> = {}
) {
  const finalParams = { ...DEFAULT_MARKET_PARAMS, ...params };
  await contract.createMarket(
    finalParams.marketId,
    finalParams.question,
    finalParams.outcomes,
    finalParams.duration
  );
  return finalParams;
}

/**
 * Fast forward blockchain time
 */
export async function fastForward(seconds: number) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

/**
 * Get current block timestamp
 */
export async function getBlockTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock("latest");
  return block!.timestamp;
}

/**
 * Calculate payment for shares
 */
export function calculatePayment(shares: number): bigint {
  return SHARE_PRICE * BigInt(shares);
}

/**
 * Get all signers with labeled names
 */
export async function getSigners() {
  const signers = await ethers.getSigners();
  return {
    deployer: signers[0],
    creator: signers[1],
    user1: signers[2],
    user2: signers[3],
    user3: signers[4],
  };
}

/**
 * Market status enum values
 */
export enum MarketStatus {
  Active = 0,
  Closed = 1,
  Settled = 2,
}

/**
 * Create multiple markets for testing
 */
export async function createMultipleMarkets(
  contract: any,
  count: number,
  baseParams: Partial<MarketParams> = {}
) {
  const markets: MarketParams[] = [];

  for (let i = 0; i < count; i++) {
    const params = {
      ...DEFAULT_MARKET_PARAMS,
      ...baseParams,
      marketId: `market-${i + 1}`,
      question: `Test Question ${i + 1}`,
    };
    await contract.createMarket(
      params.marketId,
      params.question,
      params.outcomes,
      params.duration
    );
    markets.push(params);
  }

  return markets;
}

/**
 * Generate realistic market questions
 */
export const SAMPLE_MARKETS = [
  {
    marketId: "btc-100k",
    question: "Will Bitcoin reach $100,000 by Q4 2024?",
    outcomes: ["Yes - Above $100k", "No - Below $100k"],
  },
  {
    marketId: "eth-merge-success",
    question: "Will Ethereum successfully complete the next major upgrade?",
    outcomes: ["Yes - Successful", "No - Delayed/Failed"],
  },
  {
    marketId: "fed-rate-dec",
    question: "Fed interest rate decision in December?",
    outcomes: [
      "Cut 50+ bps",
      "Cut 25 bps",
      "No change",
      "Increase",
    ],
  },
  {
    marketId: "sol-500",
    question: "Will Solana reach $500?",
    outcomes: ["Yes", "No", "Undetermined"],
  },
  {
    marketId: "election-2024",
    question: "US Presidential Election 2024 Winner?",
    outcomes: ["Democrat", "Republican", "Other"],
  },
];

/**
 * Verify market structure
 */
export async function verifyMarketStructure(
  contract: any,
  marketId: string,
  expectedOutcomes: number
) {
  const market = await contract.getMarket(marketId);

  return {
    exists: market.exists,
    outcomeCount: market.outcomeLabels.length,
    yesHandlesCount: market.yesShareHandles.length,
    noHandlesCount: market.noShareHandles.length,
    isValid:
      market.exists &&
      market.outcomeLabels.length === expectedOutcomes &&
      market.yesShareHandles.length === expectedOutcomes &&
      market.noShareHandles.length === expectedOutcomes,
  };
}
