"use client";

import { useReadContract } from "wagmi";
import { formatEther, Address } from "viem";
import { CONTRACT_ADDRESS } from "@/config/constants";
import blocxtactoeAbiArtifact from "@/abi/blocxtactoeabi.json";
import { useTokenBalance } from "@/hooks/useTokenBalance";

const blocxtactoeAbi = (blocxtactoeAbiArtifact as { abi: unknown[] }).abi;

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

  return (
    <span className="font-semibold text-white">
      {formatEther(betAmount)} {displayName}
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

// Component to display token option with balance in dropdown
export function TokenOption({ 
  tokenAddress, 
  isSelected 
}: { 
  tokenAddress: Address; 
  isSelected: boolean;
}) {
  const { data: tokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getTokenName",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: { enabled: !!tokenAddress },
  });

  const { formatted: balance, isLoading } = useTokenBalance(tokenAddress);

  const isETH = !tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000";
  
  const displayName = isETH
    ? "ETH (Native)"
    : tokenName && typeof tokenName === "string" && tokenName.length > 0
    ? tokenName
    : `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;

  // Extract symbol for balance display
  const tokenSymbol = isETH 
    ? "ETH" 
    : tokenName && typeof tokenName === "string" && tokenName.length > 0
    ? tokenName.split(" ")[0] // Get first word (e.g., "USDC" from "USDC")
    : "TOKEN";

  return (
    <div className="flex items-center justify-between w-full">
      <span>{displayName}</span>
      {isLoading ? (
        <span className="text-gray-500 text-xs ml-2">Loading...</span>
      ) : (
        <span className="text-gray-400 text-xs ml-2">
          Balance: {parseFloat(balance).toFixed(4)} {tokenSymbol}
        </span>
      )}
    </div>
  );
}

