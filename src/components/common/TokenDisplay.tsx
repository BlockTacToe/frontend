"use client";

import { useReadContract } from "wagmi";
import { formatEther, Address } from "viem";
import { CONTRACT_ADDRESS } from "@/config/constants";
import blocxtactoeAbiArtifact from "@/abi/blocxtactoeabi.json";

const blocxtactoeAbi = (blocxtactoeAbiArtifact as { abi: unknown[] }).abi;

// Helper component to display bet amount with token name
export function BetAmountDisplay({ 
  betAmount, 
  tokenAddress 
}: { 
  betAmount: bigint; 
  tokenAddress?: Address;
}) {
  const { data: tokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getTokenName",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: { enabled: !!tokenAddress },
  });

  const displayName =
    !tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000"
      ? "ETH"
      : tokenName && typeof tokenName === "string" && tokenName.length > 0
      ? tokenName
      : `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;

  return (
    <span className="font-semibold text-white">
      {formatEther(betAmount)} {displayName}
    </span>
  );
}

// Helper component to display just token name
export function TokenNameDisplay({ tokenAddress }: { tokenAddress?: Address }) {
  const { data: tokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getTokenName",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: { enabled: !!tokenAddress },
  });

  const displayName =
    !tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000"
      ? "ETH"
      : tokenName && typeof tokenName === "string" && tokenName.length > 0
      ? tokenName
      : `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;

  return <>{displayName}</>;
}

