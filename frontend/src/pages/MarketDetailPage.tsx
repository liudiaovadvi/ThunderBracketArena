import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Share2, Star, ExternalLink, AlertCircle } from "lucide-react"
import { useAccount } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { Layout } from "@/components/layout/Layout"
import { OutcomeRow, MarketStats } from "@/components/market"
import { TradingPanel } from "@/components/trading"
import { BlurFade } from "@/components/magicui/blur-fade"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMarketStore } from "@/store/marketStore"
import { useBuyShares } from "@/hooks/usePredictionMarket"
import { useFhe } from "@/contexts/FheContext"
import { Outcome, MarketStatus } from "@/types/market"

export function MarketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { selectedMarket, loading, fetchMarket } = useMarketStore()
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { instance: fheInstance, isInitializing: fheInitializing, error: fheError, initialize: initFhe } = useFhe()

  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<"yes" | "no" | null>(null)

  // Use the real buyShares hook
  const { buyShares, isPending, isConfirming, isSuccess } = useBuyShares()

  useEffect(() => {
    if (id) {
      fetchMarket(id)
    }
  }, [id, fetchMarket])

  // Reset selection after successful trade
  useEffect(() => {
    if (isSuccess) {
      // Refresh market data after successful trade
      if (id) {
        fetchMarket(id)
      }
    }
  }, [isSuccess, id, fetchMarket])

  const handleOutcomeSelect = (outcome: Outcome, position: "yes" | "no") => {
    setSelectedOutcome(outcome)
    setSelectedPosition(position)
  }

  const handleTrade = async (shares: number, position: "yes" | "no") => {
    if (!selectedMarket || !selectedOutcome || !fheInstance) {
      console.error("Missing required data for trade")
      return
    }

    try {
      await buyShares(
        selectedMarket.id,
        selectedOutcome.id,
        position === "yes",
        shares
      )
    } catch (err) {
      console.error("Trade failed:", err)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </Layout>
    )
  }

  if (!selectedMarket) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Market not found</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Markets
            </Button>
          </Link>
        </div>
      </Layout>
    )
  }

  const isSettled = selectedMarket.status === MarketStatus.Settled
  const winningOutcome = isSettled
    ? selectedMarket.outcomes.find((o) => o.id === selectedMarket.winningOutcomeId)
    : null

  // Check if trading is possible
  const canTrade = isConnected && fheInstance && !fheInitializing && !isSettled

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

        {/* FHE Status Alert */}
        {isConnected && fheInitializing && (
          <BlurFade delay={0.02}>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Initializing FHE encryption... This may take a few seconds.
              </AlertDescription>
            </Alert>
          </BlurFade>
        )}

        {isConnected && fheError && !fheInstance && (
          <BlurFade delay={0.02}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{fheError}</span>
                <Button variant="outline" size="sm" onClick={() => initFhe()} className="ml-4">
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </BlurFade>
        )}

        {/* Market Header */}
        <BlurFade delay={0.05}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="fhe">FHE Protected</Badge>
                {fheInstance && isConnected && (
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    FHE Ready
                  </Badge>
                )}
                {isSettled && winningOutcome && (
                  <Badge variant="yes">
                    Resolved: {winningOutcome.label}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold">{selectedMarket.question}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://sepolia.etherscan.io/address/0x443BF6b3e453E8e6982D5048386800bD61cc3451"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Contract
                </a>
              </Button>
            </div>
          </div>
        </BlurFade>

        {/* Market Stats */}
        <BlurFade delay={0.1}>
          <MarketStats market={selectedMarket} />
        </BlurFade>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Outcomes List */}
          <div className="lg:col-span-2 space-y-4">
            <BlurFade delay={0.15}>
              <h2 className="text-xl font-semibold">Outcomes</h2>
            </BlurFade>
            <div className="space-y-3">
              {selectedMarket.outcomes.map((outcome, index) => (
                <BlurFade key={outcome.id} delay={0.2 + index * 0.05}>
                  <OutcomeRow
                    outcome={outcome}
                    isWinner={isSettled && outcome.id === selectedMarket.winningOutcomeId}
                    marketSettled={isSettled}
                    onSelect={handleOutcomeSelect}
                    selectedOutcome={selectedOutcome}
                    selectedPosition={selectedPosition}
                  />
                </BlurFade>
              ))}
            </div>
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-1">
            <BlurFade delay={0.3}>
              <TradingPanel
                outcome={selectedOutcome}
                position={selectedPosition}
                onTrade={handleTrade}
                isConnected={canTrade}
                onConnect={openConnectModal || (() => {})}
                isLoading={isPending || isConfirming}
              />
            </BlurFade>
          </div>
        </div>
      </div>
    </Layout>
  )
}
