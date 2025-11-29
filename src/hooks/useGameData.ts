"use client";

import { useReadContract } from "wagmi";
import { Address } from "viem";
import blocxtactoeAbiArtifact from "@/abi/blocxtactoeabi.json";
import { CONTRACT_ADDRESS } from "@/config/constants";

// Extract ABI array from Hardhat artifact
const blocxtactoeAbi = (blocxtactoeAbiArtifact as { abi: unknown[] }).abi;

export function useGameData(gameId: bigint | undefined) {
  const { data: game, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getGame",
    args: gameId !== undefined ? [gameId] : undefined,
    query: {
      enabled: gameId !== undefined,
    },
  });

  const { data: timeRemaining } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getTimeRemaining",
    args: gameId !== undefined ? [gameId] : undefined,
    query: {
      enabled: gameId !== undefined,
      refetchInterval: 1000, // Refetch every second for countdown
    },
  });

  return {
    game,
    timeRemaining,
    isLoading,
    error,
  };
}

export function useChallengeData(challengeId: bigint | undefined) {
  const { data: challenge, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getChallenge",
    args: challengeId !== undefined ? [challengeId] : undefined,
    query: {
      enabled: challengeId !== undefined,
    },
  });

  return {
    challenge,
    isLoading,
    error,
  };
}

export function usePlayerData(playerAddress: Address | undefined) {
  const { data: player, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getPlayer",
    args: playerAddress ? [playerAddress] : undefined,
    query: {
      enabled: !!playerAddress,
    },
  });

  return {
    player,
    isLoading,
    error,
  };
}

export function useLeaderboard(limit: number = 10) {
  const { data: leaderboard, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getLeaderboard",
    args: [BigInt(limit)],
    query: {
      retry: 3,
      retryDelay: 1000,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  return {
    leaderboard: leaderboard || [],
    isLoading,
    error,
  };
}

// Note: getLatestWins was removed from contract to reduce size
// export function useLatestWins(limit: number = 10) {
//   const { data: latestWins, isLoading, error } = useReadContract({
//     address: CONTRACT_ADDRESS,
//     abi: blocxtactoeAbi,
//     functionName: "getLatestWins",
//     args: [BigInt(limit)],
//   });

//   return {
//     latestWins,
//     isLoading,
//     error,
//   };
// }

export function usePlayerChallenges(playerAddress: Address | undefined) {
  const { data: challengeIds, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getPlayerChallenges",
    args: playerAddress ? [playerAddress] : undefined,
    query: {
      enabled: !!playerAddress,
    },
  });

  return {
    challengeIds,
    isLoading,
    error,
  };
}

export function usePlayerByUsername(username: string | undefined) {
  const { data: playerData, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getPlayerByUsername",
    args: username ? [username] : undefined,
    query: {
      enabled: !!username && username.length > 0,
    },
  });

  return {
    playerAddress: Array.isArray(playerData) && playerData.length > 0 ? (playerData[0] as Address) : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    player: Array.isArray(playerData) && playerData.length > 1 ? (playerData[1] as any) : undefined,
    isLoading,
    error,
  };
}

export function useIsTokenSupported(tokenAddress: Address | undefined) {
  const { data: isSupported, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "isTokenSupported",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!tokenAddress,
    },
  });

  return {
    isSupported,
    isLoading,
    error,
  };
}

export function useChallengeCounter() {
  const { data: counter, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "challengeCounter",
  });

  return {
    counter,
    isLoading,
    error,
  };
}

// Note: registeredPlayers array was removed from contract to reduce size
// export function useRegisteredPlayers() {
//   const { data: players, isLoading, error } = useReadContract({
//     address: CONTRACT_ADDRESS,
//     abi: blocxtactoeAbi,
//     functionName: "registeredPlayers",
//   });

//   return {
//     players: Array.isArray(players) ? players : [],
//     isLoading,
//     error,
//   };
// }

