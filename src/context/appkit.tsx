"use client";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { ReactNode } from "react";

// Project ID from Reown Cloud
const projectId = "a9fbadc760baa309220363ec867b732e";

// Create metadata object
const metadata = {
  name: "BlockTacToe",
  description: "Web3 Tic-Tac-Toe Game",
  url: "https://blocktactoe.vercel.app",
  icons: ["https://blocktactoe.vercel.app/logo.png"],
};

// Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [sepolia],
  projectId,
  features: {
    analytics: true,
    email: true,
    socials: ["google", "x", "github", "discord", "apple", "facebook", "farcaster"],
    emailShowWallets: false,
  },
  allWallets: 'SHOW',
  enableExplorer: true,
});

interface AppKitProps {
  children: ReactNode;
}

export function AppKit({ children }: AppKitProps) {
  return <>{children}</>;
}

