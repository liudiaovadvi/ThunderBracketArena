import { Link } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Lock,
  Wallet,
  Target,
  TrendingUp,
  CheckCircle2,
  Zap,
  Eye,
  EyeOff,
  Users,
  Award
} from "lucide-react"
import { Layout } from "@/components/layout/Layout"
import { BlurFade } from "@/components/magicui/blur-fade"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function HowItWorksPage() {
  return (
    <Layout>
      <div className="space-y-12 pb-12">
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

        {/* Hero Section with Video */}
        <BlurFade delay={0.05}>
          <div className="text-center space-y-6">
            <Badge variant="fhe" className="text-sm px-4 py-1">
              <Lock className="h-3 w-3 mr-1" />
              Powered by Zama FHE
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold">
              How Thunder Bracket Arena Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A privacy-preserving prediction market where your positions are encrypted using Fully Homomorphic Encryption (FHE)
            </p>
          </div>
        </BlurFade>

        {/* Demo Video Section */}
        <BlurFade delay={0.1}>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <video
                className="w-full aspect-video"
                controls
                poster="/video-poster.png"
              >
                <source src="/test.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </CardContent>
          </Card>
        </BlurFade>

        {/* What is Binary Prediction Market */}
        <BlurFade delay={0.15}>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">What is a Binary Prediction Market?</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Simple YES/NO Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    A binary prediction market allows you to bet on the outcome of future events with simple YES or NO positions. Each market has multiple outcomes, and you can choose to bet YES (it will happen) or NO (it won't happen) for each outcome.
                  </p>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Badge variant="yes" className="text-sm">YES</Badge>
                    <span className="text-sm">= You believe this outcome will occur</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Badge variant="no" className="text-sm">NO</Badge>
                    <span className="text-sm">= You believe this outcome won't occur</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    How Winnings Work
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    When the market resolves, if your prediction was correct:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <span className="text-sm">If you bet YES on the winning outcome, you win</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <span className="text-sm">If you bet NO on a losing outcome, you win</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <span className="text-sm">Winnings are proportional to your shares and the final pool</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </BlurFade>

        {/* Why FHE Privacy Matters */}
        <BlurFade delay={0.2}>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold">Why FHE Privacy Matters</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-purple-500/20">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                    <EyeOff className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">Hidden Positions</CardTitle>
                  <CardDescription>
                    Your bet amounts are encrypted on-chain. No one can see how much you've wagered.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-purple-500/20">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">Fair Markets</CardTitle>
                  <CardDescription>
                    Prevents front-running and manipulation since large positions can't be detected.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-purple-500/20">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                    <Lock className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">Secure Settlement</CardTitle>
                  <CardDescription>
                    FHE allows calculations on encrypted data, ensuring fair payouts without revealing positions.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </BlurFade>

        {/* Step by Step Guide */}
        <BlurFade delay={0.25}>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold">How to Use Thunder Bracket Arena</h2>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      1
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Connect Your Wallet
                      </h3>
                      <p className="text-muted-foreground">
                        Click "Connect Wallet" in the top right corner. Make sure you're on the Sepolia testnet. The FHE encryption system will initialize automatically once connected.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">MetaMask</Badge>
                        <Badge variant="outline">WalletConnect</Badge>
                        <Badge variant="outline">Coinbase Wallet</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      2
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Browse Prediction Markets
                      </h3>
                      <p className="text-muted-foreground">
                        Explore active markets on the homepage. Each market shows a question with multiple possible outcomes. Use the category tabs to filter markets by Sports, Politics, Crypto, Entertainment, and more.
                      </p>
                      <div className="p-4 rounded-lg bg-muted/50 mt-2">
                        <p className="text-sm font-medium">Example Market:</p>
                        <p className="text-sm text-muted-foreground mt-1">"Who will win the NBA Championship 2025?"</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">Lakers</Badge>
                          <Badge variant="outline">Celtics</Badge>
                          <Badge variant="outline">Warriors</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      3
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Select Your Position
                      </h3>
                      <p className="text-muted-foreground">
                        Click on a market to view details. For each outcome, you can choose:
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
                          <Badge variant="yes" className="mb-2">YES</Badge>
                          <p className="text-sm text-muted-foreground">You think this outcome will happen</p>
                        </div>
                        <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                          <Badge variant="no" className="mb-2">NO</Badge>
                          <p className="text-sm text-muted-foreground">You think this outcome won't happen</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      4
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Buy Encrypted Shares
                      </h3>
                      <p className="text-muted-foreground">
                        Enter the number of shares you want to buy. Your position amount will be encrypted using FHE before being submitted to the blockchain. No one - not even the contract owner - can see your bet size.
                      </p>
                      <div className="flex items-center gap-2 p-4 rounded-lg bg-purple-500/10 mt-2">
                        <Shield className="h-5 w-5 text-purple-500" />
                        <span className="text-sm">Your shares are encrypted on-chain using Zama's fhEVM</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 5 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      5
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Claim Your Winnings
                      </h3>
                      <p className="text-muted-foreground">
                        When the market resolves, check your Portfolio page. If your prediction was correct, you can claim your winnings. If the market had no winner, you can claim a refund.
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm font-medium text-green-500">Won</p>
                          <p className="text-xs text-muted-foreground mt-1">Claim your share of the pool</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm font-medium text-yellow-500">No Winner</p>
                          <p className="text-xs text-muted-foreground mt-1">Claim your refund</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </BlurFade>

        {/* Technical Details */}
        <BlurFade delay={0.3}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Smart Contract</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Deployed on Sepolia Testnet
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Uses Zama's fhEVM for encryption
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Open source and verifiable
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">FHE Encryption</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Positions encrypted client-side
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Computations on encrypted data
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Only you can decrypt your balance
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </BlurFade>

        {/* CTA */}
        <BlurFade delay={0.35}>
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to Start Predicting?</h2>
            <p className="text-muted-foreground">
              Browse active markets and make your first privacy-preserving prediction.
            </p>
            <Link to="/">
              <Button size="lg" className="gap-2">
                Explore Markets
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </BlurFade>
      </div>
    </Layout>
  )
}
