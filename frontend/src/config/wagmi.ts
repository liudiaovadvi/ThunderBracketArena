import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";

const walletConnectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const sepoliaRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

if (!walletConnectId) {
    console.warn("VITE_WALLETCONNECT_PROJECT_ID is not set. WalletConnect connectors will not work until it is provided.");
}

export const config = getDefaultConfig({
    appName: "Thunder Bracket Arena",
    projectId: walletConnectId || "2e9cd0e8408c32cfb1a65f0aac7c5c98",
    ssr: false,
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(sepoliaRpcUrl),
    },
});
