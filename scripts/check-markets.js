const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = "0x443BF6b3e453E8e6982D5048386800bD61cc3451";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
  
  const ABI = [
    "function listMarketIds() view returns (string[])",
    "function getMarket(string) view returns (tuple(bool exists, string marketId, string question, address creator, uint256 closeTime, uint256 totalPool, uint8 status, uint8 winningOutcomeId, bool hasWinner, string[] outcomeLabels, uint256[] yesCounts, uint256[] noCounts, bytes32[] yesShareHandles, bytes32[] noShareHandles))"
  ];
  
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  
  console.log("=== ThunderBracketArena Contract Status ===");
  console.log("Address:", CONTRACT_ADDRESS);
  console.log("");
  
  try {
    const marketIds = await contract.listMarketIds();
    console.log("Market count:", marketIds.length);
    
    if (marketIds.length > 0) {
      console.log("\nMarkets:");
      for (const id of marketIds) {
        const market = await contract.getMarket(id);
        console.log(`\n[${id}]`);
        console.log("  Question:", market.question);
        console.log("  Outcomes:", market.outcomeLabels.join(", "));
        console.log("  Status:", ["Open", "Closed", "Settled", "Cancelled"][market.status]);
        console.log("  Total Pool:", ethers.formatEther(market.totalPool), "ETH");
      }
    } else {
      console.log("\n⚠️  No markets found. Need to seed data.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
