import { Link } from "react-router-dom"
import { ArrowLeft, Wallet, Lock, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Layout } from "@/components/layout/Layout"
import { BlurFade } from "@/components/magicui/blur-fade"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserPositions, useClaimWinnings, useClaimRefund, UserPositionInfo } from "@/hooks/usePredictionMarket"
import { MarketStatus } from "@/types/market"

export function PortfolioPage() {
  const { isConnected } = useAccount()
  const { positions, loading, error } = useUserPositions()
  const { claimWinnings, isPending: claimWinningsPending } = useClaimWinnings()
  const { claimRefund, isPending: claimRefundPending } = useClaimRefund()

  // Calculate stats
  const openPositions = positions.filter(p => p.marketStatus === MarketStatus.Active || p.marketStatus === MarketStatus.Closed)
  const settledPositions = positions.filter(p => p.marketStatus === MarketStatus.Settled)
  const claimablePositions = settledPositions.filter(p => !p.claimed)
  const uniqueMarkets = new Set(positions.map(p => p.marketId)).size

  const handleClaim = (position: UserPositionInfo) => {
    if (position.hasWinner) {
      // Check if this position is a winner
      const isWinner = position.isYes && position.outcomeId === position.winningOutcomeId
      if (isWinner) {
        claimWinnings(position.marketId, position.outcomeId)
      } else {
        // Can't claim - not a winner
      }
    } else {
      // No winner - can claim refund
      claimRefund(position.marketId, position.outcomeId)
    }
  }

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <BlurFade delay={0}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
              <p className="text-muted-foreground max-w-md">
                Connect your wallet to view your portfolio and track your
                encrypted positions across all prediction markets.
              </p>
            </div>
          </BlurFade>
          <BlurFade delay={0.1}>
            <ConnectButton />
          </BlurFade>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <BlurFade delay={0}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Markets</span>
          </Link>
        </BlurFade>

        {/* Header */}
        <BlurFade delay={0.05}>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <Badge variant="fhe">
              <Lock className="h-3 w-3 mr-1" />
              FHE Protected
            </Badge>
          </div>
        </BlurFade>

        {/* Error State */}
        {error && (
          <BlurFade delay={0.08}>
            <Card className="border-destructive">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Failed to load positions: {error}</span>
                </div>
              </CardContent>
            </Card>
          </BlurFade>
        )}

        {/* Portfolio Stats */}
        <BlurFade delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">Encrypted</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Only visible to you
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Open Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{openPositions.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across {uniqueMarkets} markets
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Claimable
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-500">
                      {claimablePositions.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ready to claim
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </BlurFade>

        {/* Positions */}
        <BlurFade delay={0.15}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Positions</h2>
            {loading ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <span className="text-muted-foreground text-sm">
                {positions.length} positions
              </span>
            )}
          </div>
        </BlurFade>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <BlurFade key={i} delay={0.2 + i * 0.05}>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              </BlurFade>
            ))}
          </div>
        ) : positions.length === 0 ? (
          <BlurFade delay={0.2}>
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  You don't have any positions yet
                </p>
                <Link to="/">
                  <Button>Browse Markets</Button>
                </Link>
              </CardContent>
            </Card>
          </BlurFade>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {positions.map((position, index) => (
              <BlurFade key={`${position.marketId}-${position.outcomeId}`} delay={0.2 + index * 0.05}>
                <PositionCard
                  position={position}
                  onClaim={handleClaim}
                  isClaiming={claimWinningsPending || claimRefundPending}
                />
              </BlurFade>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

// Position Card Component
function PositionCard({
  position,
  onClaim,
  isClaiming
}: {
  position: UserPositionInfo
  onClaim: (position: UserPositionInfo) => void
  isClaiming: boolean
}) {
  const isSettled = position.marketStatus === MarketStatus.Settled
  const canClaim = isSettled && !position.claimed
  const isWinner = isSettled && position.hasWinner && position.outcomeId === position.winningOutcomeId && position.isYes
  const canGetRefund = isSettled && !position.hasWinner && !position.claimed

  const getStatusBadge = () => {
    if (position.claimed) {
      return <Badge variant="outline" className="text-muted-foreground">Claimed</Badge>
    }
    if (isSettled) {
      if (position.hasWinner) {
        if (isWinner) {
          return <Badge variant="yes">Winner</Badge>
        }
        return <Badge variant="no">Lost</Badge>
      }
      return <Badge variant="outline">Refund Available</Badge>
    }
    if (position.marketStatus === MarketStatus.Closed) {
      return <Badge variant="outline">Market Closed</Badge>
    }
    return <Badge variant="fhe">Active</Badge>
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Market Question */}
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/market/${position.marketId}`}
              className="font-medium hover:text-primary transition-colors line-clamp-2"
            >
              {position.marketQuestion}
            </Link>
            {getStatusBadge()}
          </div>

          {/* Outcome */}
          <div className="flex items-center gap-2">
            <Badge variant={position.isYes ? "yes" : "no"} className="text-xs">
              {position.isYes ? "YES" : "NO"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {position.outcomeLabel}
            </span>
          </div>

          {/* Position Details */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Shares: Encrypted
            </span>
          </div>

          {/* Claim Button */}
          {canClaim && (isWinner || canGetRefund) && (
            <Button
              className="w-full mt-2"
              onClick={() => onClaim(position)}
              disabled={isClaiming}
            >
              {isClaiming ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {isWinner ? "Claim Winnings" : "Claim Refund"}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
