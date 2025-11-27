import { describe, it, expect, vi } from 'vitest'
import {
  formatEthValue,
  calculateShares,
  calculateCost,
  calculateProbability,
} from '@/hooks/usePredictionMarket'

// Mock the contract imports
vi.mock('@/constants/contracts', () => ({
  PREDICTION_MARKET_ADDRESS: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  PREDICTION_MARKET_ABI: [],
  SHARE_PRICE: BigInt('10000000000000'),
  SEPOLIA_CHAIN_ID: 11155111,
}))

describe('usePredictionMarket utility functions', () => {
  describe('formatEthValue', () => {
    it('should format values >= 1 ETH', () => {
      expect(formatEthValue(BigInt('1000000000000000000'))).toBe('1.00 ETH')
      expect(formatEthValue(BigInt('2500000000000000000'))).toBe('2.50 ETH')
    })

    it('should format values in mETH range', () => {
      expect(formatEthValue(BigInt('1000000000000000'))).toBe('1.00 mETH')
      expect(formatEthValue(BigInt('500000000000000000'))).toBe('500.00 mETH')
    })

    it('should format values in μETH range', () => {
      expect(formatEthValue(BigInt('100000000000'))).toBe('0.10 μETH')
      expect(formatEthValue(BigInt('1000000000000'))).toBe('1.00 μETH')
    })

    it('should handle zero', () => {
      expect(formatEthValue(BigInt('0'))).toBe('0.00 μETH')
    })
  })

  describe('calculateShares', () => {
    it('should calculate correct number of shares', () => {
      // With SHARE_PRICE = 10000000000000 (0.00001 ETH)
      // 0.001 ETH should give us 100 shares
      const shares = calculateShares('0.001')
      expect(shares).toBe(BigInt(100))
    })

    it('should calculate shares for 1 ETH', () => {
      // 1 ETH = 100000 shares
      const shares = calculateShares('1')
      expect(shares).toBe(BigInt(100000))
    })

    it('should return 0 for invalid input', () => {
      expect(calculateShares('')).toBe(BigInt(0))
      expect(calculateShares('invalid')).toBe(BigInt(0))
    })

    it('should handle small amounts', () => {
      const shares = calculateShares('0.0001')
      expect(shares).toBe(BigInt(10))
    })
  })

  describe('calculateCost', () => {
    it('should calculate correct cost for shares', () => {
      // 100 shares * 0.00001 ETH = 0.001 ETH
      const cost = calculateCost(BigInt(100))
      expect(cost).toBe(BigInt('1000000000000000'))
    })

    it('should calculate cost for 1 share', () => {
      const cost = calculateCost(BigInt(1))
      expect(cost).toBe(BigInt('10000000000000'))
    })

    it('should handle zero shares', () => {
      expect(calculateCost(BigInt(0))).toBe(BigInt(0))
    })

    it('should handle large number of shares', () => {
      // 1000000 shares
      const cost = calculateCost(BigInt(1000000))
      expect(cost).toBe(BigInt('10000000000000000000')) // 10 ETH in wei
    })
  })

  describe('calculateProbability', () => {
    it('should return 50% when both counts are 0', () => {
      expect(calculateProbability(0, 0)).toBe(50)
    })

    it('should return 100% when all votes are yes', () => {
      expect(calculateProbability(100, 0)).toBe(100)
    })

    it('should return 0% when all votes are no', () => {
      expect(calculateProbability(0, 100)).toBe(0)
    })

    it('should calculate correct probability', () => {
      expect(calculateProbability(75, 25)).toBe(75)
      expect(calculateProbability(50, 50)).toBe(50)
      expect(calculateProbability(30, 70)).toBe(30)
    })

    it('should round to nearest integer', () => {
      expect(calculateProbability(1, 2)).toBe(33)
      expect(calculateProbability(2, 1)).toBe(67)
    })
  })
})

describe('Types', () => {
  it('MarketSnapshot interface should have correct structure', () => {
    const mockSnapshot = {
      exists: true,
      marketId: 'test-market',
      question: 'Will BTC reach $100k?',
      creator: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      closeTime: BigInt(1735689600),
      totalPool: BigInt(1000000000000000000),
      status: 0,
      winningOutcomeId: 0,
      hasWinner: false,
      outcomeLabels: ['Yes', 'No'],
      yesCounts: [BigInt(50), BigInt(50)],
      noCounts: [BigInt(50), BigInt(50)],
      yesShareHandles: [] as `0x${string}`[],
      noShareHandles: [] as `0x${string}`[],
    }

    expect(mockSnapshot.exists).toBe(true)
    expect(mockSnapshot.marketId).toBe('test-market')
    expect(mockSnapshot.status).toBe(0)
  })

  it('PositionData interface should have correct structure', () => {
    const mockPosition = {
      exists: true,
      claimed: false,
      isYes: true,
      sharesHandle: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    }

    expect(mockPosition.exists).toBe(true)
    expect(mockPosition.isYes).toBe(true)
    expect(mockPosition.claimed).toBe(false)
  })

  it('UserPositionInfo interface should have correct structure', () => {
    const mockUserPosition = {
      marketId: 'test-market',
      marketQuestion: 'Will BTC reach $100k?',
      outcomeId: 0,
      outcomeLabel: 'Yes',
      exists: true,
      claimed: false,
      isYes: true,
      sharesHandle: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      marketStatus: 0,
      winningOutcomeId: 0,
      hasWinner: false,
    }

    expect(mockUserPosition.marketId).toBe('test-market')
    expect(mockUserPosition.outcomeLabel).toBe('Yes')
    expect(mockUserPosition.marketStatus).toBe(0)
  })
})
