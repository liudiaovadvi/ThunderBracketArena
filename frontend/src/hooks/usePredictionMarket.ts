import { useState, useEffect } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { useFhe } from "@/contexts/FheContext";
import { useTransactionToast } from "@/hooks/useTransactionToast";
import { encryptShares } from "@/lib/fhe";
import {
  PREDICTION_MARKET_ADDRESS,
  PREDICTION_MARKET_ABI,
  SHARE_PRICE,
  SEPOLIA_CHAIN_ID,
} from "@/constants/contracts";

// Types for contract data
export interface MarketSnapshot {
  exists: boolean;
  marketId: string;
  question: string;
  creator: `0x${string}`;
  closeTime: bigint;
  totalPool: bigint;
  status: number;
  winningOutcomeId: number;
  hasWinner: boolean;
  outcomeLabels: string[];
  yesCounts: bigint[];
  noCounts: bigint[];
  yesShareHandles: `0x${string}`[];
  noShareHandles: `0x${string}`[];
}

export interface PositionData {
  exists: boolean;
  claimed: boolean;
  isYes: boolean;
  sharesHandle: `0x${string}`;
}

// Read hooks
export function useMarketIds() {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "listMarketIds",
    chainId: SEPOLIA_CHAIN_ID,
  });
}

export function useMarket(marketId: string | undefined) {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getMarket",
    args: marketId ? [marketId] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!marketId,
    },
  });
}

export function useMarketStatus(marketId: string | undefined) {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getMarketStatus",
    args: marketId ? [marketId] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!marketId,
    },
  });
}

export function usePosition(
  marketId: string | undefined,
  outcomeId: number | undefined,
  userAddress: `0x${string}` | undefined
) {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "getPosition",
    args:
      marketId !== undefined && outcomeId !== undefined && userAddress
        ? [marketId, outcomeId, userAddress]
        : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!marketId && outcomeId !== undefined && !!userAddress,
    },
  });
}

export function useSharePrice() {
  return useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: "SHARE_PRICE",
    chainId: SEPOLIA_CHAIN_ID,
  });
}

// Write hooks
export function useBuyShares() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { instance } = useFhe();
  const { address } = useAccount();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Add transaction toast notifications
  useTransactionToast({
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    pendingMessage: "Buying shares...",
    successMessage: "Shares purchased successfully!",
    errorMessage: "Failed to buy shares",
  });

  const buyShares = async (
    marketId: string,
    outcomeId: number,
    isYes: boolean,
    shares: number
  ) => {
    if (!instance) {
      throw new Error("FHE instance not initialized");
    }
    if (!address) {
      throw new Error("Wallet not connected");
    }

    // Encrypt the shares amount using the CDN-based SDK
    const { sharesHandle, proof } = await encryptShares(shares, address);

    // Calculate payment
    const payment = SHARE_PRICE * BigInt(shares);

    writeContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "buyShares",
      args: [
        marketId,
        outcomeId,
        isYes,
        sharesHandle,
        proof,
      ],
      value: payment,
      chainId: SEPOLIA_CHAIN_ID,
    });
  };

  return {
    buyShares,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useAdjustPosition() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { instance } = useFhe();
  const { address } = useAccount();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Add transaction toast notifications
  useTransactionToast({
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    pendingMessage: "Adjusting position...",
    successMessage: "Position adjusted successfully!",
    errorMessage: "Failed to adjust position",
  });

  const adjustPosition = async (
    marketId: string,
    outcomeId: number,
    newIsYes: boolean,
    newShares: number
  ) => {
    if (!instance) {
      throw new Error("FHE instance not initialized");
    }
    if (!address) {
      throw new Error("Wallet not connected");
    }

    // Encrypt the new shares amount using the CDN-based SDK
    const { sharesHandle, proof } = await encryptShares(newShares, address);

    writeContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "adjustPosition",
      args: [
        marketId,
        outcomeId,
        newIsYes,
        sharesHandle,
        proof,
      ],
      chainId: SEPOLIA_CHAIN_ID,
    });
  };

  return {
    adjustPosition,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useClaimWinnings() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Add transaction toast notifications
  useTransactionToast({
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    pendingMessage: "Claiming winnings...",
    successMessage: "Winnings claimed successfully!",
    errorMessage: "Failed to claim winnings",
  });

  const claimWinnings = (marketId: string, outcomeId: number) => {
    writeContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "claimWinnings",
      args: [marketId, outcomeId],
      chainId: SEPOLIA_CHAIN_ID,
    });
  };

  return {
    claimWinnings,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useClaimRefund() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Add transaction toast notifications
  useTransactionToast({
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    pendingMessage: "Claiming refund...",
    successMessage: "Refund claimed successfully!",
    errorMessage: "Failed to claim refund",
  });

  const claimRefund = (marketId: string, outcomeId: number) => {
    writeContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "claimRefund",
      args: [marketId, outcomeId],
      chainId: SEPOLIA_CHAIN_ID,
    });
  };

  return {
    claimRefund,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Utility functions
export function formatEthValue(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  if (eth >= 1) return `${eth.toFixed(2)} ETH`;
  if (eth >= 0.001) return `${(eth * 1000).toFixed(2)} mETH`;
  return `${(eth * 1e6).toFixed(2)} μETH`;
}

export function calculateShares(ethAmount: string): bigint {
  try {
    const weiAmount = parseEther(ethAmount);
    return weiAmount / SHARE_PRICE;
  } catch {
    return 0n;
  }
}

export function calculateCost(shares: bigint): bigint {
  return shares * SHARE_PRICE;
}

// Helper to calculate probability from share counts
export function calculateProbability(yesCount: number, noCount: number): number {
  const total = yesCount + noCount;
  if (total === 0) return 50;
  return Math.round((yesCount / total) * 100);
}

// Hook to get all user positions across all markets
export function useUserPositions() {
  const { address } = useAccount();
  const { data: marketIds, isLoading: marketIdsLoading } = useMarketIds();

  const [positions, setPositions] = useState<UserPositionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPositions() {
      // Cast marketIds to string array since contract returns string[]
      const marketIdArray = marketIds as string[] | undefined;

      if (!address || !marketIdArray || marketIdArray.length === 0) {
        setPositions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const allPositions: UserPositionInfo[] = [];

        // For each market, fetch market data and check positions for each outcome
        for (const marketId of marketIdArray) {
          // Fetch market data
          const marketData = await fetchMarketData(marketId);
          if (!marketData || !marketData.exists) continue;

          // Check positions for each outcome
          for (let outcomeId = 0; outcomeId < marketData.outcomeLabels.length; outcomeId++) {
            const positionData = await fetchPositionData(marketId, outcomeId, address);

            if (positionData && positionData.exists) {
              allPositions.push({
                marketId,
                marketQuestion: marketData.question,
                outcomeId,
                outcomeLabel: marketData.outcomeLabels[outcomeId],
                exists: positionData.exists,
                claimed: positionData.claimed,
                isYes: positionData.isYes,
                sharesHandle: positionData.sharesHandle,
                marketStatus: marketData.status,
                winningOutcomeId: marketData.winningOutcomeId,
                hasWinner: marketData.hasWinner,
              });
            }
          }
        }

        setPositions(allPositions);
      } catch (err) {
        console.error("Failed to fetch positions:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch positions");
      } finally {
        setLoading(false);
      }
    }

    fetchPositions();
  }, [address, marketIds]);

  return {
    positions,
    loading: loading || marketIdsLoading,
    error,
    refetch: () => {
      setLoading(true);
      // Trigger re-fetch by updating state
    },
  };
}

// Helper type for user positions
export interface UserPositionInfo {
  marketId: string;
  marketQuestion: string;
  outcomeId: number;
  outcomeLabel: string;
  exists: boolean;
  claimed: boolean;
  isYes: boolean;
  sharesHandle: `0x${string}`;
  marketStatus: number;
  winningOutcomeId: number;
  hasWinner: boolean;
}

// Helper function to fetch market data (uses direct contract call)
async function fetchMarketData(marketId: string): Promise<MarketSnapshot | null> {
  try {
    const { createPublicClient, http } = await import("viem");
    const { sepolia } = await import("viem/chains");

    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const data = await client.readContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "getMarket",
      args: [marketId],
    }) as MarketSnapshot;

    return data;
  } catch (err) {
    console.error(`Failed to fetch market ${marketId}:`, err);
    return null;
  }
}

// Helper function to fetch position data
async function fetchPositionData(
  marketId: string,
  outcomeId: number,
  userAddress: `0x${string}`
): Promise<{ exists: boolean; claimed: boolean; isYes: boolean; sharesHandle: `0x${string}` } | null> {
  try {
    const { createPublicClient, http } = await import("viem");
    const { sepolia } = await import("viem/chains");

    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const [exists, claimed, isYes, sharesHandle] = await client.readContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: "getPosition",
      args: [marketId, outcomeId, userAddress],
    }) as [boolean, boolean, boolean, `0x${string}`];

    return { exists, claimed, isYes, sharesHandle };
  } catch (err) {
    console.error(`Failed to fetch position for ${marketId}/${outcomeId}:`, err);
    return null;
  }
}

