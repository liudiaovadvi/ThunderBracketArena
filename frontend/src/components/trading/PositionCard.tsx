import { ArrowUpRight, ArrowDownRight, Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Position } from "@/types/market"
import { cn } from "@/lib/utils"

interface PositionCardProps {
  position: Position
  onSell?: (position: Position) => void
}

export function PositionCard({ position, onSell }: PositionCardProps) {
  const pnl = position.currentValue - position.avgCost
  const pnlPercent = position.avgCost > BigInt(0)
    ? Number((pnl * BigInt(10000)) / position.avgCost) / 100
    : 0
  const isProfitable = pnl >= BigInt(0)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Position Info */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant={position.isYes ? "yes" : "no"}>
                {position.isYes ? "YES" : "NO"}
              </Badge>
              <span className="font-medium truncate">{position.outcomeLabel}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {position.marketQuestion}
            </p>
          </div>

          {/* Value & P&L */}
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-1">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Encrypted</span>
            </div>
            <p className="font-bold">{position.shares} shares</p>
            <div
              className={cn(
                "flex items-center justify-end gap-1 text-sm",
                isProfitable ? "text-yes" : "text-no"
              )}
            >
              {isProfitable ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>{pnlPercent > 0 ? "+" : ""}{pnlPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onSell?.(position)}
          >
            Sell Position
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href={`/market/${position.marketId}`}>View Market</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
