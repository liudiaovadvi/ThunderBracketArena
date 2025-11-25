export interface Outcome {
  id: number
  label: string
  yesCount: number
  noCount: number
  probability: number
  yesShareHandle: string
  noShareHandle: string
}

export interface Market {
  id: string
  question: string
  creator: string
  closeTime: number
  totalPool: bigint
  status: MarketStatus
  winningOutcomeId: number
  hasWinner: boolean
  outcomes: Outcome[]
  category?: string
  icon?: string
}

export enum MarketStatus {
  Active = 0,
  Closed = 1,
  Settled = 2,
}

export interface Position {
  marketId: string
  marketQuestion: string
  outcomeId: number
  outcomeLabel: string
  exists?: boolean
  claimed?: boolean
  isYes: boolean
  shares: number
  avgCost: bigint
  currentValue: bigint
  sharesHandle?: string
  decryptedShares?: bigint
}

export interface TradeParams {
  marketId: string
  outcomeId: number
  isYes: boolean
  shares: number
  amount: bigint
}

export interface MarketFilter {
  category: string
  status: MarketStatus | "all"
  search: string
  sortBy: "volume" | "newest" | "ending"
}
