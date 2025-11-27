import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cn,
  formatAddress,
  formatEther,
  formatVolume,
  formatPrice,
  formatProbability,
  formatCountdown,
  formatDate,
  formatDateTime,
  calculateProbability,
  sleep,
} from '@/lib/utils'

describe('cn (className utility)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('formatAddress', () => {
  it('should format address correctly', () => {
    expect(formatAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234...5678')
  })

  it('should return empty string for empty input', () => {
    expect(formatAddress('')).toBe('')
  })

  it('should handle undefined-like values', () => {
    expect(formatAddress(undefined as unknown as string)).toBe('')
    expect(formatAddress(null as unknown as string)).toBe('')
  })
})

describe('formatEther', () => {
  it('should format small amounts', () => {
    expect(formatEther(BigInt('10000000000000'))).toBe('< 0.0001')
  })

  it('should format amounts less than 1', () => {
    expect(formatEther(BigInt('100000000000000000'))).toBe('0.1000')
  })

  it('should format amounts less than 1000', () => {
    expect(formatEther(BigInt('5000000000000000000'))).toBe('5.00')
  })

  it('should format amounts in K', () => {
    expect(formatEther(BigInt('5000000000000000000000'))).toBe('5.0K')
  })

  it('should format amounts in M', () => {
    expect(formatEther(BigInt('5000000000000000000000000'))).toBe('5.0M')
  })
})

describe('formatVolume', () => {
  it('should format small amounts with $', () => {
    expect(formatVolume(BigInt('500000000000000000'))).toBe('$0.50')
  })

  it('should format medium amounts', () => {
    expect(formatVolume(BigInt('500000000000000000000'))).toBe('$500')
  })

  it('should format amounts in k', () => {
    expect(formatVolume(BigInt('5000000000000000000000'))).toBe('$5k')
  })

  it('should format amounts in m', () => {
    expect(formatVolume(BigInt('5000000000000000000000000'))).toBe('$5.0m')
  })
})

describe('formatPrice', () => {
  it('should format price less than 1 cent', () => {
    expect(formatPrice(0.5)).toBe('50.0¢')
  })

  it('should format price in cents', () => {
    expect(formatPrice(50)).toBe('50.0¢')
  })

  it('should format price in dollars', () => {
    expect(formatPrice(150)).toBe('$1.50')
  })
})

describe('formatProbability', () => {
  it('should return <1% for very low values', () => {
    expect(formatProbability(0.5)).toBe('<1%')
  })

  it('should return >99% for very high values', () => {
    expect(formatProbability(99.5)).toBe('>99%')
  })

  it('should round to nearest integer', () => {
    expect(formatProbability(50.4)).toBe('50%')
    expect(formatProbability(50.6)).toBe('51%')
  })
})

describe('formatCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return "Ended" for past timestamps', () => {
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
    const pastTimestamp = new Date('2025-01-01T10:00:00Z').getTime() / 1000
    expect(formatCountdown(pastTimestamp)).toBe('Ended')
  })

  it('should format days and hours', () => {
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
    const futureTimestamp = new Date('2025-01-03T14:00:00Z').getTime() / 1000
    expect(formatCountdown(futureTimestamp)).toBe('2d 2h')
  })

  it('should format hours and minutes', () => {
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
    const futureTimestamp = new Date('2025-01-01T15:30:00Z').getTime() / 1000
    expect(formatCountdown(futureTimestamp)).toBe('3h 30m')
  })

  it('should format minutes only', () => {
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
    const futureTimestamp = new Date('2025-01-01T12:45:00Z').getTime() / 1000
    expect(formatCountdown(futureTimestamp)).toBe('45m')
  })
})

describe('formatDate', () => {
  it('should format date correctly', () => {
    const timestamp = new Date('2025-01-15T00:00:00Z').getTime() / 1000
    const result = formatDate(timestamp)
    expect(result).toContain('Jan')
    expect(result).toContain('15')
    expect(result).toContain('2025')
  })
})

describe('formatDateTime', () => {
  it('should format date and time correctly', () => {
    const timestamp = new Date('2025-01-15T14:30:00Z').getTime() / 1000
    const result = formatDateTime(timestamp)
    expect(result).toContain('Jan')
    expect(result).toContain('15')
  })
})

describe('calculateProbability', () => {
  it('should return 50 when both counts are 0', () => {
    expect(calculateProbability(0, 0)).toBe(50)
  })

  it('should calculate correct probability', () => {
    expect(calculateProbability(75, 25)).toBe(75)
    expect(calculateProbability(50, 50)).toBe(50)
    expect(calculateProbability(100, 0)).toBe(100)
    expect(calculateProbability(0, 100)).toBe(0)
  })

  it('should round to nearest integer', () => {
    expect(calculateProbability(33, 67)).toBe(33)
    expect(calculateProbability(67, 33)).toBe(67)
  })
})

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should resolve after specified time', async () => {
    const promise = sleep(1000)
    vi.advanceTimersByTime(1000)
    await expect(promise).resolves.toBeUndefined()
  })
})
