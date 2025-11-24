import { Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { config } from "./config/wagmi"
import { FheProvider } from "./contexts/FheContext"
import { HomePage, MarketDetailPage, PortfolioPage, HowItWorksPage } from "@/pages"
import { Toaster } from "@/components/ui/sonner"
import "@rainbow-me/rainbowkit/styles.css"

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <FheProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/market/:id" element={<MarketDetailPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
            </Routes>
            <Toaster />
          </FheProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
