'use client'

import { wagmiAdapter, projectId } from '@/lib/appkitConfig'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { baseSepolia } from '@reown/appkit/networks' // Base Sepolia
// import { base } from '@reown/appkit/networks' // Base Mainnet
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Set up metadata for BlOcXTacToe
const metadata = {
  name: 'BlOcXTacToe',
  description: 'Decentralized Tic Tac Toe on Base Sepolia',
  url: 'https://blocxtactoe.vercel.app',
  icons: ['https://blocxtactoe.vercel.app/bbt-logo.png']
}

// Create the AppKit modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [baseSepolia], // Base Sepolia
  // networks: [base], // Base Mainnet - commented out
  defaultNetwork: baseSepolia, // Base Sepolia
  // defaultNetwork: base, // Base Mainnet - commented out
  metadata: metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

function AppKitProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default AppKitProvider
