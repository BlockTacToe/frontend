"use client";

import { useReadContract } from "wagmi";
import { formatEther, formatUnits, Address } from "viem";
import { CONTRACT_ADDRESS } from "@/config/constants";
import blocxtactoeAbiArtifact from "@/abi/blocxtactoeabi.json";
import { useTokenBalance } from "@/hooks/useTokenBalance";

const blocxtactoeAbi = (blocxtactoeAbiArtifact as { abi: unknown[] }).abi;

// Standard ERC20 ABI for decimals
const erc20Abi = [
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;

// Helper component to display bet amount with token name
export function BetAmountDisplay({ 
  betAmount, 
  tokenAddress 
}: { 
  betAmount: bigint; 
  tokenAddress?: Address;
}) {
  // Normalize token address for comparison (handle both string and Address types)
  const normalizedAddress = tokenAddress 
    ? (typeof tokenAddress === "string" ? tokenAddress.toLowerCase() : tokenAddress.toLowerCase())
    : null;
  
  // Check if it's ETH (zero address or undefined)
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const isETH = !normalizedAddress || normalizedAddress === zeroAddress;

  // Get token decimals for proper formatting
  const { data: tokenDecimals } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: { 
      enabled: !isETH && !!tokenAddress,
    },
  });

  // Only fetch token name if it's NOT ETH and we have a valid address
  const { data: tokenName, isLoading: isLoadingTokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getTokenName",
    args: !isETH && tokenAddress ? [tokenAddress] : undefined,
    query: { 
      enabled: !isETH && !!tokenAddress,
    },
  });

  // Determine display name
  let displayName: string;
  if (isETH) {
    displayName = "ETH";
  } else if (isLoadingTokenName) {
    // Show address while loading token name
    displayName = tokenAddress ? `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}` : "TOKEN";
  } else if (tokenName && typeof tokenName === "string" && tokenName.length > 0) {
    displayName = tokenName;
  } else {
    // Fallback to address if token name not found
    displayName = tokenAddress ? `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}` : "TOKEN";
  }

  // Format the amount with correct decimals
  const decimals = isETH ? 18 : (tokenDecimals ? Number(tokenDecimals) : 18);
  const formattedAmount = isETH 
    ? formatEther(betAmount) 
    : formatUnits(betAmount, decimals);

  return (
    <span className="font-semibold text-white">
      {formattedAmount} {displayName}
    </span>
  );
}

// Helper component to display just token name
export function TokenNameDisplay({ tokenAddress }: { tokenAddress?: Address }) {
  // Normalize token address for comparison (handle both string and Address types)
  const normalizedAddress = tokenAddress 
    ? (typeof tokenAddress === "string" ? tokenAddress.toLowerCase() : tokenAddress.toLowerCase())
    : null;
  
  // Check if it's ETH (zero address or undefined)
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const isETH = !normalizedAddress || normalizedAddress === zeroAddress;

  // Only fetch token name if it's NOT ETH and we have a valid address
  const { data: tokenName, isLoading: isLoadingTokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getTokenName",
    args: !isETH && tokenAddress ? [tokenAddress] : undefined,
    query: { 
      enabled: !isETH && !!tokenAddress,
    },
  });

  // Determine display name
  let displayName: string;
  if (isETH) {
    displayName = "ETH";
  } else if (isLoadingTokenName) {
    // Show address while loading token name
    displayName = tokenAddress ? `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}` : "TOKEN";
  } else if (tokenName && typeof tokenName === "string" && tokenName.length > 0) {
    displayName = tokenName;
  } else {
    // Fallback to address if token name not found
    displayName = tokenAddress ? `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}` : "TOKEN";
  }

  return <>{displayName}</>;
}

// Component to display token option in dropdown (without balance)
export function TokenOption({ 
  tokenAddress, 
  isSelected 
}: { 
  tokenAddress: Address; 
  isSelected: boolean;
}) {
  // Normalize token address for comparison
  const normalizedAddress = tokenAddress 
    ? (typeof tokenAddress === "string" ? tokenAddress.toLowerCase() : tokenAddress.toLowerCase())
    : null;
  
  // Check if it's ETH (zero address)
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const isETH = !normalizedAddress || normalizedAddress === zeroAddress;

  // Only fetch token name if it's NOT ETH
  const { data: tokenName, isLoading: isLoadingTokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getTokenName",
    args: !isETH && tokenAddress ? [tokenAddress] : undefined,
    query: { 
      enabled: !isETH && !!tokenAddress,
    },
  });

  const displayName = isETH
    ? "ETH (Native)"
    : isLoadingTokenName
    ? `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`
    : tokenName && typeof tokenName === "string" && tokenName.length > 0
    ? tokenName
    : `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;

  return <span>{displayName}</span>;
}

// Component to display token balance below bet amount input
export function TokenBalanceDisplay({ tokenAddress }: { tokenAddress: Address }) {
  const { formatted: balance, isLoading } = useTokenBalance(tokenAddress);
  
  // Check if it's ETH (zero address)
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const normalizedAddress = tokenAddress.toLowerCase();
  const isETH = normalizedAddress === zeroAddress;

  // Get token name for display
  const { data: tokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getTokenName",
    args: !isETH && tokenAddress ? [tokenAddress] : undefined,
    query: { 
      enabled: !isETH && !!tokenAddress,
    },
  });

  // Extract symbol for balance display
  const tokenSymbol = isETH 
    ? "ETH" 
    : tokenName && typeof tokenName === "string" && tokenName.length > 0
    ? tokenName.split(" ")[0] // Get first word (e.g., "USDC" from "USDC (Base)")
    : "TOKEN";

  if (isLoading) {
    return (
      <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-400">
        Balance: Loading...
      </p>
    );
  }

  return (
    <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-400">
      Balance: <span className="text-green-400 font-medium">{parseFloat(balance).toFixed(4)} {tokenSymbol}</span>
    </p>
  );
}

