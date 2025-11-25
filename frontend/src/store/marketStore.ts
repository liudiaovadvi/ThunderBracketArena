import { create } from "zustand"
import { createPublicClient, http } from "viem"
import { sepolia } from "viem/chains"
import { Market, MarketStatus, Outcome } from "@/types/market"
import {
  PREDICTION_MARKET_ADDRESS,
  PREDICTION_MARKET_ABI,
} from "@/constants/contracts"

// Create a public client for reading contract data
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
})

// Category mapping based on market question keywords
function categorizeMarket(question: string): string {
  const q = question.toLowerCase()
  if (q.includes("btc") || q.includes("bitcoin") || q.includes("eth") || q.includes("crypto")) {
    return "crypto"
  }
  if (q.includes("fed") || q.includes("rate") || q.includes("inflation") || q.includes("market")) {
    return "finance"
  }
  if (q.includes("trump") || q.includes("election") || q.includes("president") || q.includes("ceasefire") || q.includes("russia") || q.includes("ukraine")) {
    return "politics"
  }
  if (q.includes("nfl") || q.includes("nba") || q.includes("superbowl") || q.includes("championship") || q.includes("wins")) {
    return "sports"
  }
  return "other"
}

// Transform contract data to Market type
function transformContractMarket(data: any): Market {
  const outcomes: Outcome[] = data.outcomeLabels.map((label: string, idx: number) => {
    const yesCount = Number(data.yesCounts[idx] || 0n)
    const noCount = Number(data.noCounts[idx] || 0n)
    const total = yesCount + noCount
    const probability = total > 0 ? Math.round((yesCount / total) * 100) : 50

    return {
      id: idx,
      label,
      yesCount,
      noCount,
      probability,
      yesShareHandle: data.yesShareHandles?.[idx] || "",
      noShareHandle: data.noShareHandles?.[idx] || "",
    }
  })

  return {
    id: data.marketId,
    question: data.question,
    creator: data.creator,
    closeTime: Number(data.closeTime),
    totalPool: data.totalPool,
    status: data.status as MarketStatus,
    winningOutcomeId: data.winningOutcomeId,
    hasWinner: data.hasWinner,
    outcomes,
    category: categorizeMarket(data.question),
  }
}

interface MarketState {
  markets: Market[]
  selectedMarket: Market | null
  loading: boolean
  error: string | null
  filter: {
    category: string
    search: string
    status: MarketStatus | "all"
  }
  setFilter: (filter: Partial<MarketState["filter"]>) => void
  fetchMarkets: () => Promise<void>
  fetchMarket: (id: string) => Promise<void>
  getFilteredMarkets: () => Market[]
}

export const useMarketStore = create<MarketState>((set, get) => ({
  markets: [],
  selectedMarket: null,
  loading: false,
  error: null,
  filter: {
    category: "all",
    search: "",
    status: "all",
  },

  setFilter: (filter) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
    }))
  },

  fetchMarkets: async () => {
    set({ loading: true, error: null })
    try {
      // Fetch market IDs from contract
      const marketIds = await publicClient.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: "listMarketIds",
      }) as string[]

      if (!marketIds || marketIds.length === 0) {
        set({ markets: [], loading: false })
        return
      }

      // Fetch each market's data
      const marketPromises = marketIds.map(async (marketId) => {
        const data = await publicClient.readContract({
          address: PREDICTION_MARKET_ADDRESS,
          abi: PREDICTION_MARKET_ABI,
          functionName: "getMarket",
          args: [marketId],
        })
        return transformContractMarket(data)
      })

      const markets = await Promise.all(marketPromises)
      set({ markets, loading: false })
    } catch (err) {
      console.error("Error fetching markets:", err)
      set({ error: "Failed to fetch markets", loading: false })
    }
  },

  fetchMarket: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const data = await publicClient.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: "getMarket",
        args: [id],
      })

      const market = transformContractMarket(data)
      set({ selectedMarket: market, loading: false })
    } catch (err) {
      console.error("Error fetching market:", err)
      set({ selectedMarket: null, error: "Market not found", loading: false })
    }
  },

  getFilteredMarkets: () => {
    const { markets, filter } = get()
    return markets.filter((market) => {
      // Category filter
      if (filter.category !== "all" && market.category !== filter.category) {
        return false
      }
      // Status filter
      if (filter.status !== "all" && market.status !== filter.status) {
        return false
      }
      // Search filter
      if (filter.search) {
        const search = filter.search.toLowerCase()
        return (
          market.question.toLowerCase().includes(search) ||
          market.outcomes.some((o) => o.label.toLowerCase().includes(search))
        )
      }
      return true
    })
  },
}))
