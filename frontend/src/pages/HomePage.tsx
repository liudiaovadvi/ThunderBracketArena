import { useEffect } from "react"
import { TrendingUp, Zap, Shield } from "lucide-react"
import { Layout } from "@/components/layout/Layout"
import { MarketCard } from "@/components/market"
import { BlurFade } from "@/components/magicui/blur-fade"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useMarketStore } from "@/store/marketStore"
import { formatVolume } from "@/lib/utils"

export function HomePage() {
  const { markets, loading, fetchMarkets, getFilteredMarkets } = useMarketStore()
  const filteredMarkets = getFilteredMarkets()

  useEffect(() => {
    fetchMarkets()
  }, [fetchMarkets])

  // Calculate total volume
  const totalVolume = markets.reduce((sum, m) => sum + m.totalPool, BigInt(0))

  return (
    <Layout>
      {/* Hero Stats */}
      <BlurFade delay={0}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Total Volume</span>
            </div>
            <p className="text-3xl font-bold">{formatVolume(totalVolume)}</p>
          </div>
          <div className="bg-gradient-to-br from-yes/10 to-yes/5 rounded-xl p-6 border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Active Markets</span>
            </div>
            <p className="text-3xl font-bold">
              <NumberTicker value={markets.length} />
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-xl p-6 border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Privacy</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">FHE</p>
              <Badge variant="fhe">Protected</Badge>
            </div>
          </div>
        </div>
      </BlurFade>

      {/* Markets Header */}
      <BlurFade delay={0.1}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Markets</h2>
          <span className="text-muted-foreground">
            {filteredMarkets.length} markets
          </span>
        </div>
      </BlurFade>

      {/* Markets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredMarkets.length === 0 ? (
        <BlurFade delay={0.2}>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No markets found</p>
          </div>
        </BlurFade>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarkets.map((market, index) => (
            <MarketCard key={market.id} market={market} index={index} />
          ))}
        </div>
      )}
    </Layout>
  )
}
