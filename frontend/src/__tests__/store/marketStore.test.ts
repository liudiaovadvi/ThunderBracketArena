import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMarketStore } from '@/store/marketStore'
import { MarketStatus } from '@/types/market'

// Mock viem client
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem')
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      readContract: vi.fn(),
    })),
  }
})

describe('useMarketStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useMarketStore.setState({
      markets: [],
      selectedMarket: null,
      loading: false,
      error: null,
      filter: {
        category: 'all',
        search: '',
        status: 'all',
      },
    })
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useMarketStore.getState()
      expect(state.markets).toEqual([])
      expect(state.selectedMarket).toBeNull()
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.filter).toEqual({
        category: 'all',
        search: '',
        status: 'all',
      })
    })
  })

  describe('setFilter', () => {
    it('should update category filter', () => {
      const { setFilter } = useMarketStore.getState()
      setFilter({ category: 'crypto' })

      const state = useMarketStore.getState()
      expect(state.filter.category).toBe('crypto')
      expect(state.filter.search).toBe('')
      expect(state.filter.status).toBe('all')
    })

    it('should update search filter', () => {
      const { setFilter } = useMarketStore.getState()
      setFilter({ search: 'bitcoin' })

      const state = useMarketStore.getState()
      expect(state.filter.search).toBe('bitcoin')
    })

    it('should update status filter', () => {
      const { setFilter } = useMarketStore.getState()
      setFilter({ status: MarketStatus.Active })

      const state = useMarketStore.getState()
      expect(state.filter.status).toBe(MarketStatus.Active)
    })

    it('should preserve other filters when updating one', () => {
      const { setFilter } = useMarketStore.getState()
      setFilter({ category: 'politics', search: 'election' })
      setFilter({ status: MarketStatus.Closed })

      const state = useMarketStore.getState()
      expect(state.filter.category).toBe('politics')
      expect(state.filter.search).toBe('election')
      expect(state.filter.status).toBe(MarketStatus.Closed)
    })
  })

  describe('getFilteredMarkets', () => {
    beforeEach(() => {
      // Setup mock markets
      useMarketStore.setState({
        markets: [
          {
            id: '1',
            question: 'Will Bitcoin reach $100k?',
            creator: '0x123',
            closeTime: 1735689600,
            totalPool: BigInt(1000),
            status: MarketStatus.Active,
            winningOutcomeId: 0,
            hasWinner: false,
            outcomes: [{ id: 0, label: 'Yes', yesCount: 50, noCount: 50, probability: 50, yesShareHandle: '', noShareHandle: '' }],
            category: 'crypto',
          },
          {
            id: '2',
            question: 'Will Trump win the election?',
            creator: '0x456',
            closeTime: 1735689600,
            totalPool: BigInt(2000),
            status: MarketStatus.Active,
            winningOutcomeId: 0,
            hasWinner: false,
            outcomes: [{ id: 0, label: 'Yes', yesCount: 60, noCount: 40, probability: 60, yesShareHandle: '', noShareHandle: '' }],
            category: 'politics',
          },
          {
            id: '3',
            question: 'Fed rate cut in December?',
            creator: '0x789',
            closeTime: 1735689600,
            totalPool: BigInt(500),
            status: MarketStatus.Closed,
            winningOutcomeId: 0,
            hasWinner: false,
            outcomes: [{ id: 0, label: 'Yes', yesCount: 70, noCount: 30, probability: 70, yesShareHandle: '', noShareHandle: '' }],
            category: 'finance',
          },
        ],
      })
    })

    it('should return all markets when no filter is applied', () => {
      const { getFilteredMarkets } = useMarketStore.getState()
      const filtered = getFilteredMarkets()
      expect(filtered.length).toBe(3)
    })

    it('should filter by category', () => {
      const { setFilter } = useMarketStore.getState()
      setFilter({ category: 'crypto' })

      const filtered = useMarketStore.getState().getFilteredMarkets()
      expect(filtered.length).toBe(1)
      expect(filtered[0].id).toBe('1')
    })

    it('should filter by status', () => {
      const { setFilter } = useMarketStore.getState()
      setFilter({ status: MarketStatus.Closed })

      const filtered = useMarketStore.getState().getFilteredMarkets()
      expect(filtered.length).toBe(1)
      expect(filtered[0].id).toBe('3')
    })

    it('should filter by search term in question', () => {
      const { setFilter } = useMarketStore.getState()
      setFilter({ search: 'bitcoin' })

      const filtered = useMarketStore.getState().getFilteredMarkets()
      expect(filtered.length).toBe(1)
      expect(filtered[0].id).toBe('1')
    })

    it('should filter by search term case-insensitively', () => {
      const { setFilter } = useMarketStore.getState()
      setFilter({ search: 'TRUMP' })

      const filtered = useMarketStore.getState().getFilteredMarkets()
      expect(filtered.length).toBe(1)
      expect(filtered[0].id).toBe('2')
    })

    it('should combine multiple filters', () => {
      const { setFilter } = useMarketStore.getState()
      setFilter({ category: 'politics', status: MarketStatus.Active })

      const filtered = useMarketStore.getState().getFilteredMarkets()
      expect(filtered.length).toBe(1)
      expect(filtered[0].id).toBe('2')
    })
  })

  describe('loading and error states', () => {
    it('should update loading state', () => {
      useMarketStore.setState({ loading: true })
      expect(useMarketStore.getState().loading).toBe(true)

      useMarketStore.setState({ loading: false })
      expect(useMarketStore.getState().loading).toBe(false)
    })

    it('should update error state', () => {
      useMarketStore.setState({ error: 'Failed to fetch markets' })
      expect(useMarketStore.getState().error).toBe('Failed to fetch markets')

      useMarketStore.setState({ error: null })
      expect(useMarketStore.getState().error).toBeNull()
    })
  })
})
