import { useState, useMemo } from "react"
import { ArrowRight, Shield, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { Outcome } from "@/types/market"
import { SHARE_PRICE } from "@/lib/constants"
import { cn, formatEther } from "@/lib/utils"

interface TradingPanelProps {
  outcome: Outcome | null
  position: "yes" | "no" | null
  onTrade?: (shares: number, position: "yes" | "no") => Promise<void>
  isConnected: boolean
  onConnect: () => void
  isLoading?: boolean
}

export function TradingPanel({
  outcome,
  position,
  onTrade,
  isConnected,
  onConnect,
  isLoading = false,
}: TradingPanelProps) {
  const [shares, setShares] = useState<string>("100")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Combine local and external loading states
  const isBusy = isSubmitting || isLoading
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy")

  const sharesNum = parseInt(shares) || 0
  const totalCost = useMemo(() => {
    return BigInt(sharesNum) * SHARE_PRICE
  }, [sharesNum])

  const potentialWin = useMemo(() => {
    if (!outcome || !position) return BigInt(0)
    const prob = position === "yes" ? outcome.probability : 100 - outcome.probability
    // Simplified: potential = (shares * 100 / prob) - cost
    const payout = BigInt(sharesNum) * BigInt(100) / BigInt(prob || 1)
    return (payout - BigInt(sharesNum)) * SHARE_PRICE
  }, [outcome, position, sharesNum])

  const handleSubmit = async () => {
    if (!outcome || !position || !onTrade) return
    setIsSubmitting(true)
    try {
      await onTrade(sharesNum, position)
    } finally {
      setIsSubmitting(false)
    }
  }

  const presetAmounts = [10, 50, 100, 500]

  if (!outcome || !position) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground py-8">
            <p>Select an outcome to start trading</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Trade</CardTitle>
          <Badge variant="fhe">
            <Shield className="h-3 w-3 mr-1" />
            FHE Protected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Outcome */}
        <div className="p-3 rounded-lg bg-muted/50 space-y-1">
          <p className="text-sm text-muted-foreground">Selected Outcome</p>
          <p className="font-medium">{outcome.label}</p>
          <Badge variant={position === "yes" ? "yes" : "no"} className="mt-1">
            {position === "yes" ? "YES" : "NO"} @ {position === "yes" ? outcome.probability : 100 - outcome.probability}¢
          </Badge>
        </div>

        {/* Buy/Sell Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "buy" | "sell")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="space-y-4 mt-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Shares</label>
              <Input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                min="1"
                placeholder="Enter number of shares"
              />
              {/* Preset amounts */}
              <div className="flex gap-2">
                {presetAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex-1",
                      sharesNum === amount && "border-primary bg-primary/5"
                    )}
                    onClick={() => setShares(amount.toString())}
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per share</span>
                <span>0.00001 ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total cost</span>
                <span className="font-medium">{formatEther(totalCost)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potential win</span>
                <span className={cn("font-medium", position === "yes" ? "text-yes" : "text-no")}>
                  +{formatEther(potentialWin)} ETH
                </span>
              </div>
            </div>

            {/* Submit Button */}
            {isConnected ? (
              <ShimmerButton
                className="w-full"
                shimmerColor={position === "yes" ? "#22c55e" : "#ef4444"}
                background={position === "yes" ? "#16a34a" : "#dc2626"}
                onClick={handleSubmit}
                disabled={isBusy || sharesNum < 1}
              >
                {isBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isLoading ? "Confirming on-chain..." : "Processing..."}
                  </>
                ) : (
                  <>
                    Buy {position.toUpperCase()}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </ShimmerButton>
            ) : (
              <Button className="w-full" onClick={onConnect}>
                Connect Wallet to Trade
              </Button>
            )}
          </TabsContent>
          <TabsContent value="sell" className="space-y-4 mt-4">
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Sell functionality is under development.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Currently, positions are settled when the market closes.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Privacy Notice */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Your position is encrypted using FHE technology
        </div>
      </CardContent>
    </Card>
  )
}
