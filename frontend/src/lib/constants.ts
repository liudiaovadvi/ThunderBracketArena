export const SHARE_PRICE = BigInt("10000000000000") // 0.00001 ETH in wei
export const MIN_SHARES = 1
export const MAX_SHARES = 1000000

export const SEPOLIA_CHAIN_ID = 11155111

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "politics", label: "Politics" },
  { id: "crypto", label: "Crypto" },
  { id: "sports", label: "Sports" },
  { id: "finance", label: "Finance" },
  { id: "tech", label: "Tech" },
  { id: "culture", label: "Culture" },
] as const

export const MARKET_STATUS = {
  ACTIVE: 0,
  CLOSED: 1,
  SETTLED: 2,
} as const

export const STATUS_LABELS = {
  [MARKET_STATUS.ACTIVE]: "Active",
  [MARKET_STATUS.CLOSED]: "Closed",
  [MARKET_STATUS.SETTLED]: "Settled",
} as const

export const STATUS_COLORS = {
  [MARKET_STATUS.ACTIVE]: "bg-green-100 text-green-800",
  [MARKET_STATUS.CLOSED]: "bg-yellow-100 text-yellow-800",
  [MARKET_STATUS.SETTLED]: "bg-purple-100 text-purple-800",
} as const
