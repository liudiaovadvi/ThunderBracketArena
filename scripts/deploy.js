const hre = require("hardhat");

async function main() {
  console.log("Deploying PredictionMarket...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  console.log("Deploying PredictionMarket contract...");
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const market = await PredictionMarket.deploy();
  await market.waitForDeployment();

  const contractAddress = await market.getAddress();
  console.log("PredictionMarket deployed to:", contractAddress);

  console.log("\nContract Info:");
  console.log("  SHARE_PRICE:", hre.ethers.formatEther(await market.SHARE_PRICE()), "ETH");
  console.log("  MIN_SHARES:", (await market.MIN_SHARES()).toString());
  console.log("  MAX_SHARES:", (await market.MAX_SHARES()).toString());
  console.log("  MIN_DURATION:", (await market.MIN_DURATION()).toString(), "seconds");
  console.log("  MAX_DURATION:", (await market.MAX_DURATION()).toString(), "seconds");
  console.log("  MAX_OUTCOMES:", (await market.MAX_OUTCOMES()).toString());

  console.log("\nDeployment complete!");
  console.log("\nNext steps:");
  console.log("  1. Run seed script: npm run seed");
  console.log("  2. Update frontend contract address");
  console.log("  3. Start frontend: cd frontend && npm run dev");
  console.log("\nView on Etherscan:");
  console.log(`  https://sepolia.etherscan.io/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
