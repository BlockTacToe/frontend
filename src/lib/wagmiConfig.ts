// src/lib/wagmiConfig.ts
import { createConfig, http, fallback } from "wagmi";
import { baseSepolia } from "wagmi/chains"; // Base Sepolia
import {
  injected,
  walletConnect,
  metaMask,
  coinbaseWallet,
} from "wagmi/connectors";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

// Create WalletConnect connector only once
let walletConnectConnector: any = null;

const getWalletConnectConnector = () => {
  if (!walletConnectConnector) {
    walletConnectConnector = walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
      metadata: {
        name: "BlOcXTacToe",
        description: "Decentralized Tic Tac Toe on Base Sepolia",
        url: "https://blocxtactoe.vercel.app",
        icons: ["https://blocxtactoe.vercel.app/bbt-logo.png"],
      },
    });
  }
  return walletConnectConnector;
};

// Use environment variable for custom RPC or fallback to reliable public endpoints
const getRpcUrl = () => {
  // Allow custom RPC via environment variable
  if (process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL) {
    return process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL;
  }
  // Use faster public RPC endpoints with fallback
  return "https://base-sepolia-rpc.publicnode.com";
};

// Optimized RPC configuration for better Farcaster compatibility
// Using fallback with multiple endpoints for reliability
export const config = createConfig({
  chains: [baseSepolia], // Base Sepolia
  transports: {
    [baseSepolia.id]: fallback([
      // Primary: Fast public RPC
      http(getRpcUrl(), {
        batch: true,
        retryCount: 2, // Reduced from 3 for faster failure
        retryDelay: 500, // Reduced from 1000ms for faster retries
        timeout: 10000, // 10 second timeout
      }),
      // Fallback: Official Base Sepolia RPC
      http("https://sepolia.base.org", {
        batch: true,
        retryCount: 1, // Minimal retries for fallback
        retryDelay: 500,
        timeout: 10000,
      }),
    ]),
  },
  connectors: [
    // Farcaster Mini App connector as the primary option
    farcasterMiniApp(),
    injected({
      target: "metaMask",
    }),
    metaMask(),
    coinbaseWallet({
      appName: "BlOcXTacToe",
    }),
    getWalletConnectConnector(),
  ],
  ssr: false, // Disable SSR to avoid indexedDB issues
  multiInjectedProviderDiscovery: true,
});
