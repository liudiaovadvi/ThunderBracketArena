import { TrendingUp, Users, Clock, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Market, MarketStatus } from "@/types/market"
import { formatVolume, formatTimeRemaining, formatAddress } from "@/lib/utils"

interface MarketStatsProps {
  market: Market
}

export function MarketStats({ market }: MarketStatsProps) {
  const isActive = market.status === MarketStatus.Active
  const isClosed = market.status === MarketStatus.Closed
  const isSettled = market.status === MarketStatus.Settled

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Volume */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Volume</span>
            </div>
            <p className="text-lg font-bold">{formatVolume(market.totalPool)}</p>
          </div>

          {/* Participants */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Outcomes</span>
            </div>
            <p className="text-lg font-bold">{market.outcomes.length}</p>
          </div>

          {/* Time Remaining */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Ends</span>
            </div>
            <p className="text-lg font-bold">
              {isSettled
                ? "Settled"
                : isClosed
                ? "Closed"
                : formatTimeRemaining(market.closeTime)}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Status</span>
            </div>
            <div>
              {isActive && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Active
                </Badge>
              )}
              {isClosed && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  Closed
                </Badge>
              )}
              {isSettled && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Settled
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Creator info */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>Created by {formatAddress(market.creator)}</span>
          <Badge variant="fhe">FHE Protected</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
