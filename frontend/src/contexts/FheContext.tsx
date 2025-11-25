import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAccount, useChainId } from "wagmi";
import { initializeFHE, getFHEInstance, isFheReady, resetFHEInstance } from "@/lib/fhe";
import { SEPOLIA_CHAIN_ID } from "@/constants/contracts";

interface FheContextType {
  instance: any | null;
  isInitializing: boolean;
  error: string | null;
  initialize: () => Promise<void>;
}

const FheContext = createContext<FheContextType>({
  instance: null,
  isInitializing: false,
  error: null,
  initialize: async () => {},
});

export const useFhe = () => {
  const context = useContext(FheContext);
  if (!context) {
    throw new Error("useFhe must be used within FheProvider");
  }
  return context;
};

export const FheProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [instance, setInstance] = useState<any | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const lastAddressRef = useRef<string | undefined>(undefined);

  const initialize = useCallback(async () => {
    // Check if already initializing or ready
    if (isInitializing) {
      return;
    }

    // Check if FHE is already ready
    if (isFheReady()) {
      setInstance(getFHEInstance());
      setError(null);
      return;
    }

    // Check network - FHE only works on Sepolia
    if (chainId !== SEPOLIA_CHAIN_ID) {
      setError("Please switch to Sepolia network for FHE encryption");
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const fheInstance = await initializeFHE();
      setInstance(fheInstance);
      setError(null);
    } catch (err) {
      console.error("Failed to initialize FHE instance:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      // Provide more user-friendly error messages
      if (errorMessage.includes("CALL_EXCEPTION")) {
        setError("Network error: Please ensure you're connected to Sepolia and try again");
      } else if (errorMessage.includes("No wallet provider")) {
        setError("Please connect your wallet first");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, chainId]);

  // Initialize when wallet connects on correct network
  useEffect(() => {
    if (isConnected && !instance && !isInitializing && chainId === SEPOLIA_CHAIN_ID) {
      initialize();
    }
  }, [isConnected, instance, isInitializing, initialize, chainId]);

  // Reset instance when wallet disconnects
  useEffect(() => {
    if (!isConnected && instance) {
      resetFHEInstance();
      setInstance(null);
      setError(null);
    }
  }, [isConnected, instance]);

  // Reset and re-initialize when address changes (but not on first connect)
  useEffect(() => {
    if (isConnected && address && lastAddressRef.current && lastAddressRef.current !== address) {
      // Address actually changed, reset FHE
      resetFHEInstance();
      setInstance(null);
      setError(null);
      // Don't call initialize here, let the other effect handle it
    }
    lastAddressRef.current = address;
  }, [isConnected, address]);

  // Re-initialize when chain changes to Sepolia
  useEffect(() => {
    if (isConnected && chainId === SEPOLIA_CHAIN_ID && !instance && !isInitializing) {
      initialize();
    } else if (chainId !== SEPOLIA_CHAIN_ID && instance) {
      // Wrong network, clear the instance
      resetFHEInstance();
      setInstance(null);
      setError("Please switch to Sepolia network for FHE encryption");
    }
  }, [chainId, isConnected, instance, isInitializing, initialize]);

  return (
    <FheContext.Provider value={{ instance, isInitializing, error, initialize }}>
      {children}
    </FheContext.Provider>
  );
};
