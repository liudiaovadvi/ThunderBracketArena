const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.PREDICTION_MARKET_ADDRESS;
  if (!contractAddress) {
    console.error("PREDICTION_MARKET_ADDRESS not set");
    process.exit(1);
  }

  console.log("Seeding PredictionMarket at:", contractAddress, "\n");

  const [signer] = await hre.ethers.getSigners();
  console.log("Seeding from:", signer.address);

  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  const market = await hre.ethers.getContractAt("PredictionMarket", contractAddress);

  const sampleMarkets = [
    {
      marketId: "fed-dec-2024",
      question: "Fed Interest Rate Decision December 2024",
      outcomes: [
        "50+ bps decrease",
        "25 bps decrease",
        "No change",
        "25 bps increase",
        "50+ bps increase"
      ],
      duration: 7 * 24 * 60 * 60
    },
    {
      marketId: "btc-100k-2024",
      question: "Will BTC reach $100,000 by end of 2024?",
      outcomes: [
        "Yes, above $100k",
        "No, below $100k"
      ],
      duration: 14 * 24 * 60 * 60
    },
    {
      marketId: "eth-merge-success",
      question: "Ethereum Dencun upgrade success?",
      outcomes: [
        "Full success, no issues",
        "Minor issues, resolved",
        "Major issues, delayed",
        "Rollback required"
      ],
      duration: 3 * 24 * 60 * 60
    },
    {
      marketId: "sp500-rally-q4",
      question: "S&P 500 Q4 2024 Performance",
      outcomes: [
        "Up 10%+",
        "Up 5-10%",
        "Flat (-5% to +5%)",
        "Down 5-10%",
        "Down 10%+"
      ],
      duration: 30 * 24 * 60 * 60
    },
    {
      marketId: "ai-regulation-2024",
      question: "US AI Regulation Outcome 2024",
      outcomes: [
        "Strict regulation passed",
        "Moderate regulation passed",
        "Self-regulation mandate",
        "No regulation"
      ],
      duration: 21 * 24 * 60 * 60
    }
  ];

  for (const m of sampleMarkets) {
    try {
      console.log(`Creating market: ${m.marketId}`);
      const tx = await market.createMarket(
        m.marketId,
        m.question,
        m.outcomes,
        m.duration
      );
      await tx.wait();
      console.log(`  Created: ${m.question}`);
      console.log(`  Outcomes: ${m.outcomes.length}`);
      console.log(`  Duration: ${m.duration / (24 * 60 * 60)} days\n`);
    } catch (error) {
      if (error.message.includes("MarketExists")) {
        console.log(`  Skipped (already exists)\n`);
      } else {
        console.error(`  Error: ${error.message}\n`);
      }
    }
  }

  console.log("Verifying markets...");
  const marketIds = await market.listMarketIds();
  console.log(`Total markets: ${marketIds.length}`);

  for (const id of marketIds) {
    const snapshot = await market.getMarket(id);
    console.log(`\nMarket: ${id}`);
    console.log(`  Question: ${snapshot.question}`);
    console.log(`  Creator: ${snapshot.creator}`);
    console.log(`  Close Time: ${new Date(Number(snapshot.closeTime) * 1000).toISOString()}`);
    console.log(`  Outcomes: ${snapshot.outcomeLabels.join(", ")}`);
  }

  console.log("\nSeeding complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
