// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Prediction Market
 * @notice Multi-event prediction market with binary yes/no outcomes.
 *         Users can buy encrypted shares on individual outcomes.
 *         Share positions remain private until market settlement.
 *
 * Example: Market "Fed decision in December?" with outcomes:
 *   - "50+ bps decrease"
 *   - "25+ bps decrease"
 *   - "no change"
 *   - "25+ bps increase"
 *
 * Users buy YES or NO shares on any outcome independently.
 * 1 share = 0.00001 ETH (10 shares = 0.0001 ETH)
 */
contract PredictionMarket is ZamaEthereumConfig {
    uint256 public constant SHARE_PRICE = 0.00001 ether;
    uint256 public constant MIN_SHARES = 1;
    uint256 public constant MAX_SHARES = 1000000;
    uint256 public constant MIN_DURATION = 10 minutes;
    uint256 public constant MAX_DURATION = 30 days;
    uint256 public constant MAX_OUTCOMES = 10;
    uint256 public constant MIN_OUTCOMES = 2;

    enum MarketStatus {
        Active,
        Closed,
        Settled
    }

    struct Position {
        bool exists;
        bool claimed;
        bool isYes;
        euint64 shares;
    }

    struct Outcome {
        string label;
        euint64 yesShares;
        euint64 noShares;
        uint256 yesCount;
        uint256 noCount;
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

    struct MarketSnapshot {
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
        uint256[] yesCounts;
        uint256[] noCounts;
        bytes32[] yesShareHandles;
        bytes32[] noShareHandles;
    }

    mapping(string => Market) private markets;
    mapping(string => Outcome[]) private outcomes;
    mapping(string => mapping(uint8 => mapping(address => Position))) private positions;
    string[] private marketIds;

    event MarketCreated(
        string indexed marketId,
        string question,
        uint256 closeTime,
        uint8 outcomeCount
    );

    event SharesPurchased(
        string indexed marketId,
        address indexed buyer,
        uint8 outcomeId,
        bool isYes
    );

    event PositionAdjusted(
        string indexed marketId,
        address indexed trader,
        uint8 outcomeId,
        bool isYes
    );

    event MarketSettled(
        string indexed marketId,
        uint8 winningOutcomeId,
        bool hasWinner
    );

    event WinningsClaimed(
        string indexed marketId,
        address indexed trader,
        uint256 payout
    );

    event RefundClaimed(
        string indexed marketId,
        address indexed trader,
        uint256 refund
    );

    error MarketExists();
    error MarketNotFound();
    error InvalidOutcomeCount();
    error InvalidDuration();
    error MarketClosed();
    error MarketNotClosed();
    error MarketNotSettled();
    error AlreadySettled();
    error InvalidOutcome();
    error InvalidShareAmount();
    error InsufficientPayment();
    error PositionExists();
    error PositionNotFound();
    error AlreadyClaimed();
    error NotWinner();
    error NoWinnerRefundOnly();
    error TransferFailed();

    /**
     * @notice Create a new prediction market
     * @param marketId Unique identifier for the market
     * @param question The prediction question (e.g., "Fed decision in December?")
     * @param outcomeLabels Array of outcome labels (e.g., ["50+ bps decrease", "25+ bps decrease", ...])
     * @param duration How long the market stays open for trading
     */
    function createMarket(
        string calldata marketId,
        string calldata question,
        string[] calldata outcomeLabels,
        uint256 duration
    ) external {
        if (markets[marketId].exists) revert MarketExists();
        if (outcomeLabels.length < MIN_OUTCOMES || outcomeLabels.length > MAX_OUTCOMES) {
            revert InvalidOutcomeCount();
        }
        if (duration < MIN_DURATION || duration > MAX_DURATION) {
            revert InvalidDuration();
        }

        Market storage market = markets[marketId];
        market.exists = true;
        market.marketId = marketId;
        market.question = question;
        market.creator = msg.sender;
        market.closeTime = block.timestamp + duration;
        market.status = MarketStatus.Active;
        market.winningOutcomeId = type(uint8).max;

        for (uint8 i = 0; i < outcomeLabels.length; i++) {
            market.outcomeLabels.push(outcomeLabels[i]);

            Outcome storage outcome = outcomes[marketId].push();
            outcome.label = outcomeLabels[i];
            outcome.yesShares = FHE.asEuint64(0);
            outcome.noShares = FHE.asEuint64(0);
            FHE.allowThis(outcome.yesShares);
            FHE.allowThis(outcome.noShares);
        }

        marketIds.push(marketId);

        emit MarketCreated(
            marketId,
            question,
            market.closeTime,
            uint8(outcomeLabels.length)
        );
    }

    /**
     * @notice Buy shares on a specific outcome
     * @param marketId The market to trade in
     * @param outcomeId Which outcome to bet on (0-indexed)
     * @param isYes True for YES shares, false for NO shares
     * @param encryptedShares Encrypted number of shares to buy
     * @param proof ZK proof for the encrypted input
     */
    function buyShares(
        string calldata marketId,
        uint8 outcomeId,
        bool isYes,
        externalEuint64 encryptedShares,
        bytes calldata proof
    ) external payable {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();
        if (block.timestamp >= market.closeTime) revert MarketClosed();
        if (outcomeId >= outcomes[marketId].length) revert InvalidOutcome();

        Position storage position = positions[marketId][outcomeId][msg.sender];
        if (position.exists && !position.claimed) revert PositionExists();

        euint64 shares = FHE.fromExternal(encryptedShares, proof);

        uint256 maxShares = msg.value / SHARE_PRICE;
        if (maxShares < MIN_SHARES) revert InsufficientPayment();
        if (maxShares > MAX_SHARES) maxShares = MAX_SHARES;

        Outcome storage outcome = outcomes[marketId][outcomeId];

        if (isYes) {
            outcome.yesShares = FHE.add(outcome.yesShares, shares);
            FHE.allowThis(outcome.yesShares);
            outcome.yesCount += 1;
        } else {
            outcome.noShares = FHE.add(outcome.noShares, shares);
            FHE.allowThis(outcome.noShares);
            outcome.noCount += 1;
        }

        position.exists = true;
        position.claimed = false;
        position.isYes = isYes;
        position.shares = shares;
        FHE.allow(shares, msg.sender);

        market.totalPool += msg.value;

        emit SharesPurchased(marketId, msg.sender, outcomeId, isYes);
    }

    /**
     * @notice Adjust an existing position (change side or shares)
     * @param marketId The market where position exists
     * @param outcomeId Which outcome position to adjust
     * @param newIsYes New side (true for YES, false for NO)
     * @param newEncryptedShares New encrypted share amount
     * @param proof ZK proof for the encrypted input
     */
    function adjustPosition(
        string calldata marketId,
        uint8 outcomeId,
        bool newIsYes,
        externalEuint64 newEncryptedShares,
        bytes calldata proof
    ) external {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();
        if (block.timestamp >= market.closeTime) revert MarketClosed();
        if (outcomeId >= outcomes[marketId].length) revert InvalidOutcome();

        Position storage position = positions[marketId][outcomeId][msg.sender];
        if (!position.exists) revert PositionNotFound();

        Outcome storage outcome = outcomes[marketId][outcomeId];

        if (position.isYes) {
            outcome.yesShares = FHE.sub(outcome.yesShares, position.shares);
            FHE.allowThis(outcome.yesShares);
            outcome.yesCount -= 1;
        } else {
            outcome.noShares = FHE.sub(outcome.noShares, position.shares);
            FHE.allowThis(outcome.noShares);
            outcome.noCount -= 1;
        }

        euint64 newShares = FHE.fromExternal(newEncryptedShares, proof);

        if (newIsYes) {
            outcome.yesShares = FHE.add(outcome.yesShares, newShares);
            FHE.allowThis(outcome.yesShares);
            outcome.yesCount += 1;
        } else {
            outcome.noShares = FHE.add(outcome.noShares, newShares);
            FHE.allowThis(outcome.noShares);
            outcome.noCount += 1;
        }

        position.isYes = newIsYes;
        position.shares = newShares;
        position.claimed = false;
        FHE.allow(newShares, msg.sender);

        emit PositionAdjusted(marketId, msg.sender, outcomeId, newIsYes);
    }

    /**
     * @notice Settle the market by determining the winning outcome
     * @param marketId The market to settle
     * @param winningOutcomeId The actual outcome that occurred (admin determined)
     */
    function settleMarket(
        string calldata marketId,
        uint8 winningOutcomeId
    ) external {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();
        if (block.timestamp < market.closeTime) revert MarketNotClosed();
        if (market.status == MarketStatus.Settled) revert AlreadySettled();
        if (winningOutcomeId >= outcomes[marketId].length) revert InvalidOutcome();

        market.status = MarketStatus.Settled;
        market.winningOutcomeId = winningOutcomeId;

        Outcome storage winningOutcome = outcomes[marketId][winningOutcomeId];
        market.hasWinner = winningOutcome.yesCount > 0;

        emit MarketSettled(marketId, winningOutcomeId, market.hasWinner);
    }

    /**
     * @notice Claim winnings for a winning YES position
     * @param marketId The settled market
     * @param outcomeId The outcome where user has a position
     */
    function claimWinnings(
        string calldata marketId,
        uint8 outcomeId
    ) external {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();
        if (market.status != MarketStatus.Settled) revert MarketNotSettled();
        if (!market.hasWinner) revert NoWinnerRefundOnly();

        Position storage position = positions[marketId][outcomeId][msg.sender];
        if (!position.exists) revert PositionNotFound();
        if (position.claimed) revert AlreadyClaimed();

        if (outcomeId != market.winningOutcomeId || !position.isYes) {
            revert NotWinner();
        }

        Outcome storage winningOutcome = outcomes[marketId][market.winningOutcomeId];
        uint256 winners = winningOutcome.yesCount;
        require(winners > 0, "No winners");

        uint256 payout = market.totalPool / winners;

        position.claimed = true;

        (bool success, ) = payable(msg.sender).call{ value: payout }("");
        if (!success) revert TransferFailed();

        emit WinningsClaimed(marketId, msg.sender, payout);
    }

    /**
     * @notice Claim refund when no winners exist
     * @param marketId The settled market with no winners
     * @param outcomeId The outcome where user has a position
     */
    function claimRefund(
        string calldata marketId,
        uint8 outcomeId
    ) external {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();
        if (market.status != MarketStatus.Settled) revert MarketNotSettled();
        if (market.hasWinner) revert NotWinner();

        Position storage position = positions[marketId][outcomeId][msg.sender];
        if (!position.exists) revert PositionNotFound();
        if (position.claimed) revert AlreadyClaimed();

        position.claimed = true;

        uint256 totalPositions = _countTotalPositions(marketId);
        uint256 refund = market.totalPool / totalPositions;

        (bool success, ) = payable(msg.sender).call{ value: refund }("");
        if (!success) revert TransferFailed();

        emit RefundClaimed(marketId, msg.sender, refund);
    }

    /**
     * @notice Get market details
     * @param marketId The market to query
     */
    function getMarket(
        string calldata marketId
    ) external view returns (MarketSnapshot memory snapshot) {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();

        snapshot.exists = market.exists;
        snapshot.marketId = market.marketId;
        snapshot.question = market.question;
        snapshot.creator = market.creator;
        snapshot.closeTime = market.closeTime;
        snapshot.totalPool = market.totalPool;
        snapshot.status = market.status;
        snapshot.winningOutcomeId = market.winningOutcomeId;
        snapshot.hasWinner = market.hasWinner;
        snapshot.outcomeLabels = market.outcomeLabels;

        uint256 outcomeCount = outcomes[marketId].length;
        snapshot.yesCounts = new uint256[](outcomeCount);
        snapshot.noCounts = new uint256[](outcomeCount);
        snapshot.yesShareHandles = new bytes32[](outcomeCount);
        snapshot.noShareHandles = new bytes32[](outcomeCount);

        for (uint8 i = 0; i < outcomeCount; i++) {
            Outcome storage outcome = outcomes[marketId][i];
            snapshot.yesCounts[i] = outcome.yesCount;
            snapshot.noCounts[i] = outcome.noCount;
            snapshot.yesShareHandles[i] = FHE.toBytes32(outcome.yesShares);
            snapshot.noShareHandles[i] = FHE.toBytes32(outcome.noShares);
        }
    }

    /**
     * @notice Get user's position for a specific outcome
     * @param marketId The market to query
     * @param outcomeId The outcome to check
     * @param user The user address
     */
    function getPosition(
        string calldata marketId,
        uint8 outcomeId,
        address user
    ) external view returns (
        bool exists,
        bool claimed,
        bool isYes,
        bytes32 sharesHandle
    ) {
        Position storage position = positions[marketId][outcomeId][user];
        exists = position.exists;
        claimed = position.claimed;
        isYes = position.isYes;
        if (position.exists) {
            sharesHandle = FHE.toBytes32(position.shares);
        }
    }

    /**
     * @notice List all market IDs
     */
    function listMarketIds() external view returns (string[] memory) {
        return marketIds;
    }

    /**
     * @notice Get current market status
     * @param marketId The market to check
     */
    function getMarketStatus(
        string calldata marketId
    ) external view returns (MarketStatus) {
        Market storage market = markets[marketId];
        if (!market.exists) revert MarketNotFound();

        if (market.status == MarketStatus.Settled) {
            return MarketStatus.Settled;
        }

        if (block.timestamp >= market.closeTime) {
            return MarketStatus.Closed;
        }

        return MarketStatus.Active;
    }

    /**
     * @notice Internal helper to count total positions in a market
     */
    function _countTotalPositions(
        string calldata marketId
    ) internal view returns (uint256 total) {
        uint256 outcomeCount = outcomes[marketId].length;
        for (uint8 i = 0; i < outcomeCount; i++) {
            Outcome storage outcome = outcomes[marketId][i];
            total += outcome.yesCount + outcome.noCount;
        }
    }
}
