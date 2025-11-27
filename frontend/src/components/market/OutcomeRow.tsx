import { useState } from "react"
import { ChevronDown, ChevronUp, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { Outcome } from "@/types/market"
import { cn } from "@/lib/utils"

interface OutcomeRowProps {
  outcome: Outcome
  isWinner?: boolean
  marketSettled?: boolean
  onSelect?: (outcome: Outcome, position: "yes" | "no") => void
  selectedOutcome?: Outcome | null
  selectedPosition?: "yes" | "no" | null
}

export function OutcomeRow({
  outcome,
  isWinner = false,
  marketSettled = false,
  onSelect,
  selectedOutcome,
  selectedPosition,
}: OutcomeRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isSelected = selectedOutcome?.id === outcome.id
  const yesSelected = isSelected && selectedPosition === "yes"
  const noSelected = isSelected && selectedPosition === "no"

  const handleYesClick = () => {
    if (marketSettled) return
    onSelect?.(outcome, "yes")
  }

  const handleNoClick = () => {
    if (marketSettled) return
    onSelect?.(outcome, "no")
  }

  return (
    <div
      className={cn(
        "border rounded-lg p-4 transition-all duration-200",
        isWinner && "border-yes bg-yes/5",
        isSelected && "border-primary ring-1 ring-primary",
        !marketSettled && "hover:border-muted-foreground/30"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Outcome Label */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-left flex-1 min-w-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="font-medium truncate">{outcome.label}</span>
            {isWinner && (
              <Badge variant="yes" className="shrink-0">
                Winner
              </Badge>
            )}
          </button>
        </div>

        {/* Probability */}
        <div className="flex items-center gap-4">
          <div className="text-right min-w-[60px]">
            <div
              className={cn(
                "text-lg font-bold",
                outcome.probability >= 50 ? "text-yes" : "text-no"
              )}
            >
              <NumberTicker value={outcome.probability} />%
            </div>
            <div className="text-xs text-muted-foreground">chance</div>
          </div>

          {/* Trade Buttons */}
          {!marketSettled && (
            <div className="flex gap-2">
              <Button
                variant={yesSelected ? "yes" : "outline"}
                size="sm"
                onClick={handleYesClick}
                className={cn(
                  "min-w-[70px]",
                  yesSelected && "ring-2 ring-yes"
                )}
              >
                Yes {outcome.probability}¢
              </Button>
              <Button
                variant={noSelected ? "no" : "outline"}
                size="sm"
                onClick={handleNoClick}
                className={cn("min-w-[70px]", noSelected && "ring-2 ring-no")}
              >
                No {100 - outcome.probability}¢
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Yes Shares</span>
              <p className="font-medium flex items-center gap-1">
                <Lock className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Encrypted</span>
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">No Shares</span>
              <p className="font-medium flex items-center gap-1">
                <Lock className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Encrypted</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="fhe" className="text-xs">
              FHE Protected
            </Badge>
            <span>Individual positions are encrypted on-chain</span>
          </div>
        </div>
      )}
    </div>
  )
}
