export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" // Will be updated after deployment

export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "marketId", "type": "string" },
      { "internalType": "string", "name": "question", "type": "string" },
      { "internalType": "string[]", "name": "outcomeLabels", "type": "string[]" },
      { "internalType": "uint256", "name": "duration", "type": "uint256" }
    ],
    "name": "createMarket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "marketId", "type": "string" },
      { "internalType": "uint8", "name": "outcomeId", "type": "uint8" },
      { "internalType": "bool", "name": "isYes", "type": "bool" },
      { "internalType": "externalEuint64", "name": "encryptedShares", "type": "uint256" },
      { "internalType": "bytes", "name": "proof", "type": "bytes" }
    ],
    "name": "buyShares",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "marketId", "type": "string" },
      { "internalType": "uint8", "name": "outcomeId", "type": "uint8" },
      { "internalType": "bool", "name": "newIsYes", "type": "bool" },
      { "internalType": "externalEuint64", "name": "newEncryptedShares", "type": "uint256" },
      { "internalType": "bytes", "name": "proof", "type": "bytes" }
    ],
    "name": "adjustPosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "marketId", "type": "string" },
      { "internalType": "uint8", "name": "winningOutcomeId", "type": "uint8" }
    ],
    "name": "settleMarket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "marketId", "type": "string" },
      { "internalType": "uint8", "name": "outcomeId", "type": "uint8" }
    ],
    "name": "claimWinnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "marketId", "type": "string" },
      { "internalType": "uint8", "name": "outcomeId", "type": "uint8" }
    ],
    "name": "claimRefund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "marketId", "type": "string" }
    ],
    "name": "getMarket",
    "outputs": [
      {
        "components": [
          { "internalType": "bool", "name": "exists", "type": "bool" },
          { "internalType": "string", "name": "marketId", "type": "string" },
          { "internalType": "string", "name": "question", "type": "string" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "uint256", "name": "closeTime", "type": "uint256" },
          { "internalType": "uint256", "name": "totalPool", "type": "uint256" },
          { "internalType": "uint8", "name": "status", "type": "uint8" },
          { "internalType": "uint8", "name": "winningOutcomeId", "type": "uint8" },
          { "internalType": "bool", "name": "hasWinner", "type": "bool" },
          { "internalType": "string[]", "name": "outcomeLabels", "type": "string[]" },
          { "internalType": "uint256[]", "name": "yesCounts", "type": "uint256[]" },
          { "internalType": "uint256[]", "name": "noCounts", "type": "uint256[]" },
          { "internalType": "bytes32[]", "name": "yesShareHandles", "type": "bytes32[]" },
          { "internalType": "bytes32[]", "name": "noShareHandles", "type": "bytes32[]" }
        ],
        "internalType": "struct PredictionMarket.MarketSnapshot",
        "name": "snapshot",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "marketId", "type": "string" },
      { "internalType": "uint8", "name": "outcomeId", "type": "uint8" },
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getPosition",
    "outputs": [
      { "internalType": "bool", "name": "exists", "type": "bool" },
      { "internalType": "bool", "name": "claimed", "type": "bool" },
      { "internalType": "bool", "name": "isYes", "type": "bool" },
      { "internalType": "bytes32", "name": "sharesHandle", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "listMarketIds",
    "outputs": [
      { "internalType": "string[]", "name": "", "type": "string[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "marketId", "type": "string" }
    ],
    "name": "getMarketStatus",
    "outputs": [
      { "internalType": "uint8", "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SHARE_PRICE",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "marketId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "question", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "closeTime", "type": "uint256" },
      { "indexed": false, "internalType": "uint8", "name": "outcomeCount", "type": "uint8" }
    ],
    "name": "MarketCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "marketId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
      { "indexed": false, "internalType": "uint8", "name": "outcomeId", "type": "uint8" },
      { "indexed": false, "internalType": "bool", "name": "isYes", "type": "bool" }
    ],
    "name": "SharesPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "marketId", "type": "string" },
      { "indexed": false, "internalType": "uint8", "name": "winningOutcomeId", "type": "uint8" },
      { "indexed": false, "internalType": "bool", "name": "hasWinner", "type": "bool" }
    ],
    "name": "MarketSettled",
    "type": "event"
  }
] as const
