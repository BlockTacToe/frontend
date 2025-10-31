import { sepolia } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';

// For this game, we'll use Sepolia testnet
export const supportedChains: readonly [Chain, ...Chain[]] = [sepolia];

export const wagmiConfig = createConfig({
  chains: supportedChains,
  transports: {
    [sepolia.id]: http(),
  },
});

