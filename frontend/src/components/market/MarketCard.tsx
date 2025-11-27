import { Link } from "react-router-dom"
import { Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { BlurFade } from "@/components/magicui/blur-fade"
import { Market, MarketStatus } from "@/types/market"
import { formatVolume, formatTimeRemaining, cn } from "@/lib/utils"

interface MarketCardProps {
  market: Market
  index?: number
}

export function MarketCard({ market, index = 0 }: MarketCardProps) {
  const topOutcome = market.outcomes.reduce((prev, curr) =>
    curr.probability > prev.probability ? curr : prev
  )

  const isResolved = market.status === MarketStatus.Settled

  return (
    <BlurFade delay={index * 0.05}>
      <Link to={`/market/${market.id}`}>
        <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {market.question}
              </h3>
              <Badge variant="fhe" className="shrink-0">
                FHE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Top Prediction */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Leading</span>
                <span className="font-medium">{topOutcome.label}</span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                    topOutcome.probability >= 50 ? "bg-yes" : "bg-no"
                  )}
                  style={{ width: `${topOutcome.probability}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {market.outcomes.length} outcomes
                </span>
                <span
                  className={cn(
                    "font-bold text-lg",
                    topOutcome.probability >= 50 ? "text-yes" : "text-no"
                  )}
                >
                  <NumberTicker value={topOutcome.probability} />%
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            {!isResolved && market.outcomes.length === 2 && (
              <div className="flex gap-2">
                <Button
                  variant="yes"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => e.preventDefault()}
                >
                  Yes {market.outcomes[0]?.probability}¢
                </Button>
                <Button
                  variant="no"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => e.preventDefault()}
                >
                  No {market.outcomes[1]?.probability}¢
                </Button>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{formatVolume(market.totalPool)} Vol</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {isResolved ? "Resolved" : formatTimeRemaining(market.closeTime)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </BlurFade>
  )
}
