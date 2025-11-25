import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatEther(wei: bigint): string {
  const ether = Number(wei) / 1e18
  if (ether < 0.0001) return "< 0.0001"
  if (ether < 1) return ether.toFixed(4)
  if (ether < 1000) return ether.toFixed(2)
  if (ether < 1000000) return `${(ether / 1000).toFixed(1)}K`
  return `${(ether / 1000000).toFixed(1)}M`
}

export function formatVolume(wei: bigint): string {
  const usd = Number(wei) / 1e18
  if (usd < 1) return `$${usd.toFixed(2)}`
  if (usd < 1000) return `$${usd.toFixed(0)}`
  if (usd < 1000000) return `$${(usd / 1000).toFixed(0)}k`
  return `$${(usd / 1000000).toFixed(1)}m`
}

export function formatPrice(cents: number): string {
  if (cents < 1) return `${(cents * 100).toFixed(1)}¢`
  if (cents < 100) return `${cents.toFixed(1)}¢`
  return `$${(cents / 100).toFixed(2)}`
}

export function formatProbability(value: number): string {
  if (value < 1) return "<1%"
  if (value > 99) return ">99%"
  return `${Math.round(value)}%`
}

export function formatCountdown(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = timestamp - now

  if (diff <= 0) return "Ended"

  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function calculateProbability(yesCount: number, noCount: number): number {
  const total = yesCount + noCount
  if (total === 0) return 50
  return Math.round((yesCount / total) * 100)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Alias for formatCountdown
export const formatTimeRemaining = formatCountdown
