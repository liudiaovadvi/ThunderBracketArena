import { PREDICTION_MARKET_ADDRESS } from "@/constants/contracts";
import { bytesToHex, getAddress } from "viem";
import type { Address } from "viem";

declare global {
  interface Window {
    RelayerSDK?: any;
    relayerSDK?: any;
    ethereum?: any;
    okxwallet?: any;
  }
}

let fheInstance: any = null;

/**
 * Get SDK from window (loaded via static script tag in HTML)
 */
const getSDK = () => {
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires a browser environment");
  }
  const sdk = window.RelayerSDK || window.relayerSDK;
  if (!sdk) {
    throw new Error("Relayer SDK not loaded. Ensure the CDN script tag is present in index.html");
  }
  return sdk;
};

/**
 * Initialize FHE instance (singleton pattern)
 */
export const initializeFHE = async (provider?: any) => {
  if (fheInstance) return fheInstance;

  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires a browser environment");
  }

  const ethereumProvider =
    provider || window.ethereum || window.okxwallet?.provider || window.okxwallet;

  if (!ethereumProvider) {
    throw new Error("No wallet provider detected. Connect a wallet first.");
  }

  const sdk = getSDK();
  const { initSDK, createInstance, SepoliaConfig } = sdk;
  await initSDK();
  const config = { ...SepoliaConfig, network: ethereumProvider };
  fheInstance = await createInstance(config);
  return fheInstance;
};

/**
 * Get instance or initialize if needed
 */
const getInstance = async (provider?: any) => {
  if (fheInstance) return fheInstance;
  return initializeFHE(provider);
};

/**
 * Get FHE instance if it exists
 */
export const getFHEInstance = (): any => {
  return fheInstance;
};

/**
 * Check if FHE is ready
 */
export const isFheReady = (): boolean => {
  return fheInstance !== null;
};

/**
 * Reset FHE instance (useful for wallet changes)
 */
export const resetFHEInstance = () => {
  fheInstance = null;
};

/**
 * Encrypt shares amount for prediction market
 * @param shares - The number of shares to buy
 * @param userAddress - The user's wallet address
 * @param provider - Optional provider
 * @returns Encrypted shares handle and proof
 */
export async function encryptShares(
  shares: number,
  userAddress: Address,
  provider?: any
): Promise<{
  sharesHandle: `0x${string}`;
  proof: `0x${string}`;
}> {
  if (!PREDICTION_MARKET_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  const instance = await getInstance(provider);
  const contractAddr = getAddress(PREDICTION_MARKET_ADDRESS);
  const userAddr = getAddress(userAddress);

  // Validate shares amount
  const validShares = Math.max(1, Math.floor(shares));

  const input = instance.createEncryptedInput(contractAddr, userAddr);
  input.add64(BigInt(validShares)); // euint64 for shares

  const { handles, inputProof } = await input.encrypt();

  return {
    sharesHandle: bytesToHex(handles[0]) as `0x${string}`,
    proof: bytesToHex(inputProof) as `0x${string}`
  };
}

/**
 * Decrypt publicly available handles using the relayer SDK
 * Can be used to reveal position amounts after market settlement
 */
export async function publicDecryptHandles(handles: `0x${string}`[], provider?: any) {
  if (handles.length === 0) {
    throw new Error("No handles provided for public decryption");
  }

  const instance = await getInstance(provider);
  const result = await instance.publicDecrypt(handles);

  const normalized: Record<string, number | boolean> = {};
  Object.entries(result.clearValues || {}).forEach(([handle, value]) => {
    const key = handle.toLowerCase();
    normalized[key] = typeof value === "bigint" ? Number(value) : (value as number | boolean);
  });

  const values = handles.map((handle) => normalized[handle.toLowerCase()] ?? 0);

  return {
    values,
    abiEncoded: result.abiEncodedClearValues as `0x${string}`,
    proof: result.decryptionProof as `0x${string}`
  };
}
