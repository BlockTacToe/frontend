// src/lib/wagmiConfig.ts
import { createConfig, http } from "wagmi";
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

export const config = createConfig({
  chains: [baseSepolia], // Base Sepolia
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"), // Base Sepolia RPC
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
