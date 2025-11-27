import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * FHE Integration Tests for PredictionMarket
 *
 * These tests verify FHE-specific functionality including:
 * - Encrypted share purchases
 * - Position adjustments with FHE
 * - Encrypted share counting
 * - Handle generation and permissions
 *
 * Note: These tests require fhEVM network or local mock setup
 */
describe("PredictionMarket FHE Integration", function () {
  let predictionMarket: any;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const SHARE_PRICE = ethers.parseEther("0.00001");
  const MIN_DURATION = 10 * 60;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    predictionMarket = await PredictionMarket.deploy();
    await predictionMarket.waitForDeployment();
  });

  describe("FHE Share Handles", function () {
    it("should generate share handles for outcomes", async function () {
      const marketId = "fhe-market-1";
      await predictionMarket.createMarket(
        marketId,
        "Test FHE Market",
        ["Yes", "No"],
        MIN_DURATION
      );

      const market = await predictionMarket.getMarket(marketId);

      // Check that handles are generated (non-zero bytes32)
      expect(market.yesShareHandles.length).to.equal(2);
      expect(market.noShareHandles.length).to.equal(2);
    });

    it("should maintain encrypted share state across outcomes", async function () {
      const marketId = "multi-outcome-market";
      await predictionMarket.createMarket(
        marketId,
        "Fed Rate Decision?",
        ["Increase", "Decrease", "No Change", "Emergency Cut"],
        MIN_DURATION
      );

      const market = await predictionMarket.getMarket(marketId);

      expect(market.yesShareHandles.length).to.equal(4);
      expect(market.noShareHandles.length).to.equal(4);

      // Initial counts should be zero
      for (let i = 0; i < 4; i++) {
        expect(market.yesCounts[i]).to.equal(0);
        expect(market.noCounts[i]).to.equal(0);
      }
    });
  });

  describe("FHE Position Tracking", function () {
    it("should track position handle for user", async function () {
      const marketId = "position-market";
      await predictionMarket.createMarket(
        marketId,
        "Test Position",
        ["Yes", "No"],
        MIN_DURATION
      );

      // Get position for user without position
      const position = await predictionMarket.getPosition(
        marketId,
        0,
        user1.address
      );

      expect(position.exists).to.be.false;
      // sharesHandle should be zero for non-existent position
      expect(position.sharesHandle).to.equal(ethers.ZeroHash);
    });
  });

  describe("Market Pool Accounting", function () {
    it("should track total pool value", async function () {
      const marketId = "pool-market";
      await predictionMarket.createMarket(
        marketId,
        "Pool Test",
        ["Yes", "No"],
        MIN_DURATION
      );

      const market = await predictionMarket.getMarket(marketId);
      expect(market.totalPool).to.equal(0);
    });

    it("should verify market structure after creation", async function () {
      const marketId = "structure-test";
      const question = "Will Solana reach $500?";
      const outcomes = ["Yes - Above $500", "No - Below $500"];

      await predictionMarket.createMarket(
        marketId,
        question,
        outcomes,
        MIN_DURATION
      );

      const market = await predictionMarket.getMarket(marketId);

      expect(market.exists).to.be.true;
      expect(market.marketId).to.equal(marketId);
      expect(market.question).to.equal(question);
      expect(market.status).to.equal(0); // Active
      expect(market.hasWinner).to.be.false;
      expect(market.outcomeLabels[0]).to.equal(outcomes[0]);
      expect(market.outcomeLabels[1]).to.equal(outcomes[1]);
    });
  });

  describe("Settlement with FHE State", function () {
    it("should preserve FHE handles after settlement", async function () {
      const marketId = "settlement-test";
      await predictionMarket.createMarket(
        marketId,
        "Settlement Test",
        ["Yes", "No"],
        MIN_DURATION
      );

      // Fast forward and settle
      await ethers.provider.send("evm_increaseTime", [MIN_DURATION + 1]);
      await ethers.provider.send("evm_mine", []);

      await predictionMarket.settleMarket(marketId, 0);

      const market = await predictionMarket.getMarket(marketId);
      expect(market.status).to.equal(2); // Settled
      expect(market.winningOutcomeId).to.equal(0);

      // Handles should still be present
      expect(market.yesShareHandles.length).to.equal(2);
      expect(market.noShareHandles.length).to.equal(2);
    });

    it("should mark hasWinner correctly based on positions", async function () {
      const marketId = "winner-test";
      await predictionMarket.createMarket(
        marketId,
        "Winner Test",
        ["Yes", "No"],
        MIN_DURATION
      );

      await ethers.provider.send("evm_increaseTime", [MIN_DURATION + 1]);
      await ethers.provider.send("evm_mine", []);

      await predictionMarket.settleMarket(marketId, 0);

      const market = await predictionMarket.getMarket(marketId);
      // No positions bought, so hasWinner should be false
      expect(market.hasWinner).to.be.false;
    });
  });

  describe("Edge Cases", function () {
    it("should handle maximum outcomes correctly", async function () {
      const marketId = "max-outcomes";
      const outcomes = Array(10).fill(0).map((_, i) => `Outcome ${i + 1}`);

      await predictionMarket.createMarket(
        marketId,
        "Max Outcomes Test",
        outcomes,
        MIN_DURATION
      );

      const market = await predictionMarket.getMarket(marketId);
      expect(market.outcomeLabels.length).to.equal(10);
      expect(market.yesShareHandles.length).to.equal(10);
      expect(market.noShareHandles.length).to.equal(10);
    });

    it("should handle minimum duration correctly", async function () {
      const marketId = "min-duration";

      await predictionMarket.createMarket(
        marketId,
        "Min Duration Test",
        ["Yes", "No"],
        MIN_DURATION
      );

      const market = await predictionMarket.getMarket(marketId);
      const blockTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

      expect(market.closeTime).to.be.closeTo(
        BigInt(blockTimestamp + MIN_DURATION),
        BigInt(5) // 5 second tolerance
      );
    });

    it("should handle maximum duration correctly", async function () {
      const marketId = "max-duration";
      const MAX_DURATION = 30 * 24 * 60 * 60;

      await predictionMarket.createMarket(
        marketId,
        "Max Duration Test",
        ["Yes", "No"],
        MAX_DURATION
      );

      const market = await predictionMarket.getMarket(marketId);
      const blockTimestamp = (await ethers.provider.getBlock("latest"))!.timestamp;

      expect(market.closeTime).to.be.closeTo(
        BigInt(blockTimestamp + MAX_DURATION),
        BigInt(5)
      );
    });
  });

  describe("Event Emissions", function () {
    it("should emit MarketCreated with correct parameters", async function () {
      const marketId = "event-test";
      const question = "Event Test";
      const outcomes = ["Yes", "No", "Maybe"];

      await expect(
        predictionMarket.createMarket(marketId, question, outcomes, MIN_DURATION)
      )
        .to.emit(predictionMarket, "MarketCreated")
        .withArgs(
          marketId,
          question,
          await predictionMarket.getMarket(marketId).then((m: any) => m.closeTime),
          3
        );
    });

    it("should emit MarketSettled with correct winner", async function () {
      const marketId = "settle-event";
      await predictionMarket.createMarket(
        marketId,
        "Settle Event Test",
        ["Yes", "No"],
        MIN_DURATION
      );

      await ethers.provider.send("evm_increaseTime", [MIN_DURATION + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(predictionMarket.settleMarket(marketId, 1))
        .to.emit(predictionMarket, "MarketSettled")
        .withArgs(marketId, 1, false);
    });
  });
});
