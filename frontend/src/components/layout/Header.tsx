import { Link, useLocation } from "react-router-dom"
import { Search, HelpCircle, Zap } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useMarketStore } from "@/store/marketStore"
import { CATEGORIES } from "@/lib/constants"

export function Header() {
  const location = useLocation()
  const { isConnected } = useAccount()
  const { filter, setFilter } = useMarketStore()

  const isHomePage = location.pathname === "/"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl hidden sm:inline">Thunder Bracket</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              className="pl-10"
              value={filter.search}
              onChange={(e) => setFilter({ search: e.target.value })}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link to="/how-it-works">
            <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
              <HelpCircle className="h-4 w-4" />
              How it works
            </Button>
          </Link>

          <Badge variant="fhe" className="hidden md:flex">
            FHE Protected
          </Badge>

          {isConnected && (
            <Link to="/portfolio">
              <Button variant="outline" size="sm">
                Portfolio
              </Button>
            </Link>
          )}

          <ConnectButton />
        </div>
      </div>

      {/* Category Tabs - Only on home page */}
      {isHomePage && (
        <div className="container border-t">
          <nav className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={filter.category === category.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter({ category: category.id })}
                className="whitespace-nowrap"
              >
                {category.label}
              </Button>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
