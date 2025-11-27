import { describe, it, expect } from 'vitest'
import {
  SHARE_PRICE,
  MIN_SHARES,
  MAX_SHARES,
  SEPOLIA_CHAIN_ID,
  CATEGORIES,
  MARKET_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
} from '@/lib/constants'

describe('Constants', () => {
  describe('Share price constants', () => {
    it('should have correct SHARE_PRICE', () => {
      expect(SHARE_PRICE).toBe(BigInt('10000000000000'))
    })

    it('should have valid share limits', () => {
      expect(MIN_SHARES).toBe(1)
      expect(MAX_SHARES).toBe(1000000)
      expect(MIN_SHARES).toBeLessThan(MAX_SHARES)
    })
  })

  describe('Chain ID', () => {
    it('should have correct Sepolia chain ID', () => {
      expect(SEPOLIA_CHAIN_ID).toBe(11155111)
    })
  })

  describe('Categories', () => {
    it('should have required categories', () => {
      const categoryIds = CATEGORIES.map((c) => c.id)
      expect(categoryIds).toContain('all')
      expect(categoryIds).toContain('politics')
      expect(categoryIds).toContain('crypto')
      expect(categoryIds).toContain('sports')
      expect(categoryIds).toContain('finance')
      expect(categoryIds).toContain('tech')
      expect(categoryIds).toContain('culture')
    })

    it('should have labels for all categories', () => {
      CATEGORIES.forEach((category) => {
        expect(category.label).toBeTruthy()
        expect(typeof category.label).toBe('string')
      })
    })
  })

  describe('Market Status', () => {
    it('should have correct status values', () => {
      expect(MARKET_STATUS.ACTIVE).toBe(0)
      expect(MARKET_STATUS.CLOSED).toBe(1)
      expect(MARKET_STATUS.SETTLED).toBe(2)
    })

    it('should have labels for all statuses', () => {
      expect(STATUS_LABELS[MARKET_STATUS.ACTIVE]).toBe('Active')
      expect(STATUS_LABELS[MARKET_STATUS.CLOSED]).toBe('Closed')
      expect(STATUS_LABELS[MARKET_STATUS.SETTLED]).toBe('Settled')
    })

    it('should have colors for all statuses', () => {
      expect(STATUS_COLORS[MARKET_STATUS.ACTIVE]).toContain('green')
      expect(STATUS_COLORS[MARKET_STATUS.CLOSED]).toContain('yellow')
      expect(STATUS_COLORS[MARKET_STATUS.SETTLED]).toContain('purple')
    })
  })
})
