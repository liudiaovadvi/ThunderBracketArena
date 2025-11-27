import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("PredictionMarket", function () {
  let predictionMarket: any;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const SHARE_PRICE = ethers.parseEther("0.00001");
  const MIN_DURATION = 10 * 60; // 10 minutes
  const MAX_DURATION = 30 * 24 * 60 * 60; // 30 days

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    predictionMarket = await PredictionMarket.deploy();
    await predictionMarket.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      expect(await predictionMarket.getAddress()).to.be.properAddress;
    });

    it("should have correct constants", async function () {
      expect(await predictionMarket.SHARE_PRICE()).to.equal(SHARE_PRICE);
      expect(await predictionMarket.MIN_SHARES()).to.equal(1);
      expect(await predictionMarket.MAX_SHARES()).to.equal(1000000);
      expect(await predictionMarket.MIN_DURATION()).to.equal(MIN_DURATION);
      expect(await predictionMarket.MAX_DURATION()).to.equal(MAX_DURATION);
      expect(await predictionMarket.MAX_OUTCOMES()).to.equal(10);
      expect(await predictionMarket.MIN_OUTCOMES()).to.equal(2);
    });
  });

  describe("Market Creation", function () {
    it("should create a market with valid parameters", async function () {
      const marketId = "market-1";
      const question = "Will BTC reach $100k?";
      const outcomes = ["Yes", "No"];
      const duration = MIN_DURATION;

      await expect(
        predictionMarket.createMarket(marketId, question, outcomes, duration)
      ).to.emit(predictionMarket, "MarketCreated");

      const market = await predictionMarket.getMarket(marketId);
      expect(market.exists).to.be.true;
      expect(market.question).to.equal(question);
      expect(market.creator).to.equal(owner.address);
      expect(market.outcomeLabels.length).to.equal(2);
    });

    it("should reject duplicate market IDs", async function () {
      const marketId = "market-1";
      const question = "Test question";
      const outcomes = ["Yes", "No"];
      const duration = MIN_DURATION;

      await predictionMarket.createMarket(marketId, question, outcomes, duration);

      await expect(
        predictionMarket.createMarket(marketId, question, outcomes, duration)
      ).to.be.revertedWithCustomError(predictionMarket, "MarketExists");
    });

    it("should reject invalid outcome count (less than 2)", async function () {
      const marketId = "market-1";
      const question = "Test question";
      const outcomes = ["Only one"];
      const duration = MIN_DURATION;

      await expect(
        predictionMarket.createMarket(marketId, question, outcomes, duration)
      ).to.be.revertedWithCustomError(predictionMarket, "InvalidOutcomeCount");
    });

    it("should reject invalid outcome count (more than 10)", async function () {
      const marketId = "market-1";
      const question = "Test question";
      const outcomes = Array(11).fill("Outcome");
      const duration = MIN_DURATION;

      await expect(
        predictionMarket.createMarket(marketId, question, outcomes, duration)
      ).to.be.revertedWithCustomError(predictionMarket, "InvalidOutcomeCount");
    });

    it("should reject duration shorter than minimum", async function () {
      const marketId = "market-1";
      const question = "Test question";
      const outcomes = ["Yes", "No"];
      const duration = MIN_DURATION - 1;

      await expect(
        predictionMarket.createMarket(marketId, question, outcomes, duration)
      ).to.be.revertedWithCustomError(predictionMarket, "InvalidDuration");
    });

    it("should reject duration longer than maximum", async function () {
      const marketId = "market-1";
      const question = "Test question";
      const outcomes = ["Yes", "No"];
      const duration = MAX_DURATION + 1;

      await expect(
        predictionMarket.createMarket(marketId, question, outcomes, duration)
      ).to.be.revertedWithCustomError(predictionMarket, "InvalidDuration");
    });

    it("should create market with multiple outcomes", async function () {
      const marketId = "fed-market";
      const question = "Fed decision in December?";
      const outcomes = [
        "50+ bps decrease",
        "25+ bps decrease",
        "no change",
        "25+ bps increase"
      ];
      const duration = MIN_DURATION;

      await predictionMarket.createMarket(marketId, question, outcomes, duration);

      const market = await predictionMarket.getMarket(marketId);
      expect(market.outcomeLabels.length).to.equal(4);
      expect(market.outcomeLabels[0]).to.equal("50+ bps decrease");
      expect(market.outcomeLabels[3]).to.equal("25+ bps increase");
    });
  });

  describe("Market Status", function () {
    it("should return Active status for open market", async function () {
      const marketId = "market-1";
      await predictionMarket.createMarket(
        marketId,
        "Test",
        ["Yes", "No"],
        MIN_DURATION
      );

      const status = await predictionMarket.getMarketStatus(marketId);
      expect(status).to.equal(0); // MarketStatus.Active
    });

    it("should revert for non-existent market", async function () {
      await expect(
        predictionMarket.getMarketStatus("non-existent")
      ).to.be.revertedWithCustomError(predictionMarket, "MarketNotFound");
    });

    it("should return Closed status after close time", async function () {
      const marketId = "market-1";
      await predictionMarket.createMarket(
        marketId,
        "Test",
        ["Yes", "No"],
        MIN_DURATION
      );

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [MIN_DURATION + 1]);
      await ethers.provider.send("evm_mine", []);

      const status = await predictionMarket.getMarketStatus(marketId);
      expect(status).to.equal(1); // MarketStatus.Closed
    });
  });

  describe("Market Settlement", function () {
    it("should settle market after close time", async function () {
      const marketId = "market-1";
      await predictionMarket.createMarket(
        marketId,
        "Test",
        ["Yes", "No"],
        MIN_DURATION
      );

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [MIN_DURATION + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        predictionMarket.settleMarket(marketId, 0)
      ).to.emit(predictionMarket, "MarketSettled");

      const status = await predictionMarket.getMarketStatus(marketId);
      expect(status).to.equal(2); // MarketStatus.Settled
    });

    it("should reject settlement before close time", async function () {
      const marketId = "market-1";
      await predictionMarket.createMarket(
        marketId,
        "Test",
        ["Yes", "No"],
        MIN_DURATION
      );

      await expect(
        predictionMarket.settleMarket(marketId, 0)
      ).to.be.revertedWithCustomError(predictionMarket, "MarketNotClosed");
    });

    it("should reject invalid winning outcome", async function () {
      const marketId = "market-1";
      await predictionMarket.createMarket(
        marketId,
        "Test",
        ["Yes", "No"],
        MIN_DURATION
      );

      await ethers.provider.send("evm_increaseTime", [MIN_DURATION + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        predictionMarket.settleMarket(marketId, 5) // Invalid outcome
      ).to.be.revertedWithCustomError(predictionMarket, "InvalidOutcome");
    });

    it("should reject double settlement", async function () {
      const marketId = "market-1";
      await predictionMarket.createMarket(
        marketId,
        "Test",
        ["Yes", "No"],
        MIN_DURATION
      );

      await ethers.provider.send("evm_increaseTime", [MIN_DURATION + 1]);
      await ethers.provider.send("evm_mine", []);

      await predictionMarket.settleMarket(marketId, 0);

      await expect(
        predictionMarket.settleMarket(marketId, 1)
      ).to.be.revertedWithCustomError(predictionMarket, "AlreadySettled");
    });
  });

  describe("List Markets", function () {
    it("should list all market IDs", async function () {
      await predictionMarket.createMarket("market-1", "Q1", ["Yes", "No"], MIN_DURATION);
      await predictionMarket.createMarket("market-2", "Q2", ["Yes", "No"], MIN_DURATION);
      await predictionMarket.createMarket("market-3", "Q3", ["Yes", "No"], MIN_DURATION);

      const marketIds = await predictionMarket.listMarketIds();
      expect(marketIds.length).to.equal(3);
      expect(marketIds[0]).to.equal("market-1");
      expect(marketIds[1]).to.equal("market-2");
      expect(marketIds[2]).to.equal("market-3");
    });

    it("should return empty array when no markets exist", async function () {
      const marketIds = await predictionMarket.listMarketIds();
      expect(marketIds.length).to.equal(0);
    });
  });

  describe("Get Market", function () {
    it("should return market details", async function () {
      const marketId = "market-1";
      const question = "Will ETH flip BTC?";
      const outcomes = ["Yes", "No", "Maybe"];
      const duration = MIN_DURATION;

      await predictionMarket.createMarket(marketId, question, outcomes, duration);

      const market = await predictionMarket.getMarket(marketId);
      expect(market.exists).to.be.true;
      expect(market.marketId).to.equal(marketId);
      expect(market.question).to.equal(question);
      expect(market.totalPool).to.equal(0);
      expect(market.status).to.equal(0); // Active
      expect(market.outcomeLabels.length).to.equal(3);
      expect(market.yesCounts.length).to.equal(3);
      expect(market.noCounts.length).to.equal(3);
    });

    it("should revert for non-existent market", async function () {
      await expect(
        predictionMarket.getMarket("non-existent")
      ).to.be.revertedWithCustomError(predictionMarket, "MarketNotFound");
    });
  });

  describe("Get Position", function () {
    it("should return empty position for user without position", async function () {
      await predictionMarket.createMarket(
        "market-1",
        "Test",
        ["Yes", "No"],
        MIN_DURATION
      );

      const position = await predictionMarket.getPosition(
        "market-1",
        0,
        user1.address
      );
      expect(position.exists).to.be.false;
      expect(position.claimed).to.be.false;
    });
  });
});
