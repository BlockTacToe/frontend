"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "../lib/wagmiConfig";
import { MiniKitContextProvider } from '@/providers/MiniKitProvider';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <MiniKitContextProvider>{children}</MiniKitContextProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
