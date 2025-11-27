# Thunder Bracket Arena

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636.svg)
![fhEVM](https://img.shields.io/badge/fhEVM-0.9.1-purple.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)

**A Privacy-Preserving Prediction Market Platform Powered by Fully Homomorphic Encryption**

[Live Demo](https://thunder-bracket-arena-mch8bk7qe-songsus-projects.vercel.app) | [Documentation](#architecture) | [Getting Started](#quick-start)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
  - [System Architecture](#system-architecture)
  - [Smart Contract Architecture](#smart-contract-architecture)
  - [Frontend Architecture](#frontend-architecture)
- [Privacy Model](#privacy-model)
- [Technical Specifications](#technical-specifications)
- [Testing Framework](#testing-framework)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Security Considerations](#security-considerations)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Thunder Bracket Arena is a next-generation prediction market platform that leverages **Fully Homomorphic Encryption (FHE)** to enable private betting on binary outcomes. Unlike traditional prediction markets where position sizes are visible on-chain, Thunder Bracket Arena encrypts all share holdings using Zama's fhEVM, ensuring that trading strategies and position sizes remain confidential.

### The Problem

Traditional on-chain prediction markets suffer from critical privacy vulnerabilities:

- **Front-running**: Validators and MEV bots can see pending transactions and exploit large orders
- **Position Exposure**: Whale traders' strategies are visible, leading to copy-trading and manipulation
- **Market Manipulation**: Actors can influence prices by observing and reacting to large positions

### The Solution

Thunder Bracket Arena solves these issues by:

1. **Encrypting Share Holdings**: All position sizes are stored as FHE-encrypted values
2. **Private Trading**: Only the position holder can decrypt their share count
3. **Fair Market Dynamics**: Prevents front-running since share amounts are hidden
4. **Transparent Aggregates**: Total pool size and participant counts remain public for market health

---

## Key Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **Multi-Outcome Markets** | Support for 2-10 outcomes per market (e.g., election predictions, rate decisions) |
| **Binary Trading** | Buy YES (outcome occurs) or NO (outcome doesn't occur) shares on any outcome |
| **Encrypted Positions** | Share amounts encrypted using TFHE (Torus FHE) |
| **Position Adjustment** | Modify existing positions while maintaining privacy |
| **Automated Settlement** | Admin-triggered settlement with winner determination |
| **Fair Distribution** | Pool divided equally among winners; refunds when no winners exist |

### Privacy Features

- **Zero-Knowledge Share Proofs**: Prove ownership without revealing amounts
- **Encrypted Aggregation**: Total shares computed homomorphically
- **Access Control**: Per-user decryption permissions via fhEVM ACL
- **MEV Protection**: Hidden order sizes prevent front-running

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Pages     │  │  Components │  │     State Management    │  │
│  │  - Markets  │  │  - Cards    │  │  - Zustand Store        │  │
│  │  - Details  │  │  - Dialogs  │  │  - React Query Cache    │  │
│  │  - Portfolio│  │  - Forms    │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    FHE Integration Layer                    ││
│  │  - fhevmjs Client    - Encryption/Decryption               ││
│  │  - EIP-712 Signing   - Handle Management                   ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   Web3 Connection Layer                     ││
│  │  - wagmi/viem        - RainbowKit                          ││
│  │  - Contract Hooks    - Transaction Management              ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Sepolia Testnet (EVM)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              PredictionMarket.sol (fhEVM)                   ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ ││
│  │  │   Market    │  │   Outcome   │  │      Position       │ ││
│  │  │  Storage    │  │   Storage   │  │      Storage        │ ││
│  │  │  - question │  │  - label    │  │  - euint64 shares   │ ││
│  │  │  - outcomes │  │  - yesCnt   │  │  - isYes flag       │ ││
│  │  │  - status   │  │  - noCnt    │  │  - claimed flag     │ ││
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                 Zama FHE Coprocessor                        ││
│  │  - TFHE Operations   - Key Management                      ││
│  │  - Decryption Oracle - ACL Enforcement                     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Smart Contract Architecture

The `PredictionMarket.sol` contract implements a state machine pattern:

```
                    createMarket()
                         │
                         ▼
┌──────────────────────────────────────────┐
│                 ACTIVE                    │
│  - Users can buy/adjust positions        │
│  - Share amounts are encrypted           │
│  - Pool accumulates ETH                  │
└──────────────────────────────────────────┘
                         │
                         │ closeTime reached
                         ▼
┌──────────────────────────────────────────┐
│                 CLOSED                    │
│  - Trading suspended                     │
│  - Awaiting settlement                   │
└──────────────────────────────────────────┘
                         │
                         │ settleMarket()
                         ▼
┌──────────────────────────────────────────┐
│                SETTLED                    │
│  - Winners determined                    │
│  - Claims enabled                        │
│  - Pool distributed to winners           │
└──────────────────────────────────────────┘
```

#### Core Data Structures

```solidity
struct Position {
    bool exists;        // Position existence flag
    bool claimed;       // Payout claimed flag
    bool isYes;         // YES or NO position
    euint64 shares;     // FHE-encrypted share count
}

struct Outcome {
    string label;       // Outcome description
    euint64 yesShares;  // Total encrypted YES shares
    euint64 noShares;   // Total encrypted NO shares
    uint256 yesCount;   // Number of YES positions (public)
    uint256 noCount;    // Number of NO positions (public)
}

struct Market {
    bool exists;
    string marketId;
    string question;
    address creator;
    uint256 closeTime;
    uint256 totalPool;
    MarketStatus status;
    uint8 winningOutcomeId;
    bool hasWinner;
    string[] outcomeLabels;
}
```

### Frontend Architecture

```
src/
├── __tests__/              # Test suites
│   ├── hooks/              # Hook tests
│   ├── lib/                # Utility tests
│   └── store/              # Store tests
├── components/
│   ├── layout/             # Layout components (Header, Layout)
│   ├── magicui/            # Animation components (BlurFade)
│   └── ui/                 # shadcn/ui components
├── config/
│   └── wagmi.ts            # Web3 configuration
├── constants/
│   └── contracts.ts        # Contract addresses & ABIs
├── contexts/
│   └── FheContext.tsx      # FHE instance provider
├── hooks/
│   ├── useFhevm.ts         # FHE operations hook
│   └── usePredictionMarket.ts  # Contract interaction hook
├── lib/
│   ├── constants.ts        # App constants
│   └── utils.ts            # Utility functions
├── pages/
│   ├── MarketsPage.tsx     # Market listing
│   ├── MarketDetailPage.tsx# Individual market view
│   ├── PortfolioPage.tsx   # User positions
│   └── HowItWorksPage.tsx  # Documentation page
├── store/
│   └── marketStore.ts      # Zustand state management
└── types/
    └── market.ts           # TypeScript interfaces
```

---

## Privacy Model

### FHE Encryption Flow

```
User Input (plaintext shares)
         │
         ▼
┌─────────────────────┐
│  fhevmjs.encrypt()  │  ← Client-side encryption
│  - Creates einput   │
│  - Generates proof  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Smart Contract    │
│  - Validates proof  │
│  - Stores euint64   │
│  - Sets ACL perms   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  On-chain Storage   │
│  - Encrypted value  │
│  - Only user can    │
│    decrypt          │
└─────────────────────┘
```

### Access Control

| Data | Visibility | Reasoning |
|------|------------|-----------|
| Market question | Public | Essential for market discovery |
| Outcome labels | Public | Users need to see options |
| Total pool size | Public | Market liquidity indicator |
| Position count | Public | Market participation metric |
| Individual shares | Private | Prevents front-running & manipulation |
| Aggregated shares | Private | Computed homomorphically |

---

## Technical Specifications

### Contract Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `SHARE_PRICE` | 0.00001 ETH | Cost per share |
| `MIN_SHARES` | 1 | Minimum purchase |
| `MAX_SHARES` | 1,000,000 | Maximum per position |
| `MIN_DURATION` | 10 minutes | Shortest market |
| `MAX_DURATION` | 30 days | Longest market |
| `MIN_OUTCOMES` | 2 | Binary minimum |
| `MAX_OUTCOMES` | 10 | Maximum choices |

### Technology Stack

#### Smart Contract Layer
- **Solidity**: 0.8.24
- **Zama fhEVM**: 0.9.1
- **Framework**: Hardhat
- **Network**: Sepolia Testnet

#### Frontend Layer
- **Framework**: React 18.3 + TypeScript 5.6
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **State**: Zustand 5.0
- **Web3**: wagmi 2.19 + viem 2.40
- **Wallet**: RainbowKit 2.2
- **FHE Client**: fhevmjs 0.6.2
- **Animations**: Framer Motion 11.11

---

## Testing Framework

### Test Architecture

Thunder Bracket Arena employs a comprehensive testing strategy using **Vitest** as the test runner:

```
__tests__/
├── setup.ts                    # Global test configuration
├── hooks/
│   └── usePredictionMarket.test.ts  # Hook utility tests (20 tests)
├── lib/
│   ├── utils.test.ts           # Utility function tests (31 tests)
│   └── constants.test.ts       # Constants validation (8 tests)
└── store/
    └── marketStore.test.ts     # Zustand store tests (13 tests)
```

### Test Categories

#### 1. Utility Function Tests (`utils.test.ts`)
- `cn()` - Tailwind class merging
- `formatAddress()` - Ethereum address truncation
- `formatEther()` - Wei to ETH conversion
- `formatVolume()` - Large number formatting
- `formatPrice()` - Share price display
- `formatProbability()` - Percentage formatting
- `formatCountdown()` - Time remaining display
- `calculateProbability()` - Odds calculation

#### 2. Hook Tests (`usePredictionMarket.test.ts`)
- `formatEthValue()` - ETH/mETH/μETH formatting
- `calculateShares()` - ETH to share conversion
- `calculateCost()` - Share to ETH conversion
- `calculateProbability()` - Position odds calculation
- Type interface validation

#### 3. Store Tests (`marketStore.test.ts`)
- Initial state verification
- Filter operations (category, status, search)
- Market filtering logic
- Loading/error state management
- Async fetch handling

#### 4. Constants Tests (`constants.test.ts`)
- Share price validation
- Chain ID verification
- Category configuration
- Market status mappings

### Running Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run with coverage report
npm run test:coverage

# Watch mode (development)
npm test -- --watch
```

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- MetaMask or compatible wallet
- Sepolia testnet ETH

### Contract Deployment

```bash
# Clone and install
git clone <repository-url>
cd ThunderBracketArena
npm install

# Configure environment
cp .env.example .env
# Edit .env with your SEPOLIA_RPC_URL and PRIVATE_KEY

# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy

# Seed sample markets (optional)
PREDICTION_MARKET_ADDRESS=0x... npm run seed
```

### Frontend Development

```bash
cd frontend
npm install

# Development server
npm run dev

# Production build
npm run build

# Run tests
npm test
```

### Environment Variables

```bash
# Contract deployment
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key

# Frontend (optional)
VITE_CONTRACT_ADDRESS=0x...
```

---

## API Reference

### Create Market

```solidity
function createMarket(
    string calldata marketId,      // Unique identifier
    string calldata question,       // Prediction question
    string[] calldata outcomeLabels,// Possible outcomes
    uint256 duration               // Market duration in seconds
) external
```

### Buy Shares

```solidity
function buyShares(
    string calldata marketId,
    uint8 outcomeId,               // 0-indexed outcome
    bool isYes,                    // YES or NO position
    externalEuint64 encryptedShares,// FHE-encrypted amount
    bytes calldata proof           // ZK proof
) external payable
```

### Settle Market

```solidity
function settleMarket(
    string calldata marketId,
    uint8 winningOutcomeId         // The actual outcome
) external
```

### Claim Winnings

```solidity
function claimWinnings(
    string calldata marketId,
    uint8 outcomeId
) external
```

### Query Functions

```solidity
function getMarket(string calldata marketId)
    external view returns (MarketSnapshot memory)

function getPosition(string calldata marketId, uint8 outcomeId, address user)
    external view returns (bool exists, bool claimed, bool isYes, bytes32 sharesHandle)

function listMarketIds()
    external view returns (string[] memory)

function getMarketStatus(string calldata marketId)
    external view returns (MarketStatus)
```

---

## Security Considerations

### Audit Status

- [ ] Smart contract audit pending
- [x] FHE integration reviewed
- [x] Frontend security review

### Known Limitations

1. **Oracle Dependency**: Settlement relies on admin-provided outcomes
2. **FHE Performance**: Encrypted operations have higher gas costs
3. **Testnet Only**: Currently deployed on Sepolia testnet

### Best Practices

- Never share private keys
- Verify contract addresses before interaction
- Use hardware wallets for significant amounts
- Monitor gas prices during high network activity

---

## Roadmap

### Phase 1: Foundation
- [x] Core smart contract development
- [x] FHE integration with Zama fhEVM
- [x] Basic frontend implementation
- [x] Sepolia testnet deployment
- [x] Unit test framework (72 tests)

### Phase 2: Enhancement
- [ ] Decentralized oracle integration (Chainlink, UMA)
- [ ] Liquidity provider incentives
- [ ] Advanced market analytics dashboard
- [ ] Mobile-responsive optimization
- [ ] Gas optimization for FHE operations

### Phase 3: Expansion
- [ ] Multi-chain deployment (Polygon, Arbitrum)
- [ ] Governance token introduction
- [ ] Community market creation
- [ ] API for third-party integrations
- [ ] Advanced trading features (limit orders)

### Phase 4: Decentralization
- [ ] DAO governance implementation
- [ ] Decentralized settlement mechanism
- [ ] Cross-chain liquidity pools
- [ ] Mainnet deployment
- [ ] Professional market maker partnerships

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Zama](https://www.zama.ai/) - FHE technology and fhEVM
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Viem](https://viem.sh/) - Ethereum interactions

---

<div align="center">

**Built with FHE by the Thunder Bracket Arena Team**

[Website](https://thunder-bracket-arena-mch8bk7qe-songsus-projects.vercel.app) | [Twitter](#) | [Discord](#)

</div>
