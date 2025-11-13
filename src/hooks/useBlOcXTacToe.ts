"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useMemo } from "react";
import { Address, parseEther } from "viem";
import blocxtactoeAbi from "@/abi/blocxtactoeabi.json";
import { toast } from "react-hot-toast";
import { CONTRACT_ADDRESS } from "@/config/constants";

// Helper function to extract error message
function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    if ("message" in err && typeof err.message === "string") {
      return err.message;
    }
    if ("shortMessage" in err && typeof err.shortMessage === "string") {
      return err.shortMessage;
    }
  }
  return "An unknown error occurred";
}

export function useBlOcXTacToe() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // ============ READ FUNCTIONS ============

  // Get contract state
  const { data: moveTimeout } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "moveTimeout",
  });

  const { data: platformFeePercent } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "platformFeePercent",
  });

  const { data: platformFeeRecipient } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "platformFeeRecipient",
  });

  const { data: paused } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "paused",
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "owner",
  });

  // Check if user is admin
  const { data: isAdmin } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "admins",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get player info
  const { data: player } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getPlayer",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get latest game ID
  const { data: latestGameId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getLatestGameId",
  });

  // Get supported tokens
  const { data: supportedTokens } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getSupportedTokens",
  });

  // ============ WRITE FUNCTIONS ============

  // Admin Functions
  const addAdmin = async (adminAddress: Address) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "addAdmin",
        args: [adminAddress],
      });
      toast.info("Transaction submitted...");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Failed to add admin");
    }
  };

  const removeAdmin = async (adminAddress: Address) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "removeAdmin",
        args: [adminAddress],
      });
      toast.info("Transaction submitted...");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Failed to remove admin");
    }
  };

  const setMoveTimeout = async (newTimeout: bigint) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "setMoveTimeout",
        args: [newTimeout],
      });
      toast.info("Transaction submitted...");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Failed to set timeout");
    }
  };

  const setPlatformFee = async (newFeePercent: bigint) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "setPlatformFee",
        args: [newFeePercent],
      });
      toast.info("Transaction submitted...");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Failed to set platform fee");
    }
  };

  const setPlatformFeeRecipient = async (recipient: Address) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "setPlatformFeeRecipient",
        args: [recipient],
      });
      toast.info("Transaction submitted...");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Failed to set fee recipient");
    }
  };

  const setSupportedToken = async (token: Address, supported: boolean) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "setSupportedToken",
        args: [token, supported],
      });
      toast.info("Transaction submitted...");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Failed to set token support");
    }
  };

  const pause = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "pause",
      });
      toast.info("Transaction submitted...");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Failed to pause contract");
    }
  };

  const unpause = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "unpause",
      });
      toast.info("Transaction submitted...");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Failed to unpause contract");
    }
  };

  // Player Functions
  const registerPlayer = async (username: string) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      throw new Error("Please connect your wallet");
    }
    try {
      const hash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "registerPlayer",
        args: [username],
      });
      toast.info("Transaction submitted...");
      return hash;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to register player";
      toast.error(errorMsg);
      throw err;
    }
  };

  // Game Functions
  const createGame = async (betAmount: string, moveIndex: number, tokenAddress: Address = "0x0000000000000000000000000000000000000000" as Address): Promise<`0x${string}` | undefined> => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      throw new Error("Please connect your wallet");
    }
    try {
      const betAmountWei = parseEther(betAmount);
      const hash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "createGame",
        args: [betAmountWei, moveIndex, tokenAddress],
        value: tokenAddress === "0x0000000000000000000000000000000000000000" ? betAmountWei : undefined,
      }) as `0x${string}` | undefined;
      toast.info("Transaction submitted...");
      return hash;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to create game";
      toast.error(errorMsg);
      throw err;
    }
  };

  const joinGame = async (gameId: bigint, moveIndex: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      throw new Error("Please connect your wallet");
    }
    try {
      // Use useReadContract to get game data
      const { createPublicClient, http } = await import("viem");
      const { baseSepolia } = await import("wagmi/chains");
      
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
      });

      const game = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "getGame",
        args: [gameId],
      }) as {
        betAmount: bigint;
        tokenAddress: Address;
      } | null;
      
      if (!game) throw new Error("Game not found");
      
      const betAmount = game.betAmount;
      const tokenAddress = game.tokenAddress as Address;
      
      const hash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "joinGame",
        args: [gameId, moveIndex],
        value: tokenAddress === "0x0000000000000000000000000000000000000000" ? betAmount : undefined,
      });
      toast.info("Transaction submitted...");
      return hash;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to join game";
      toast.error(errorMsg);
      throw err;
    }
  };

  const play = async (gameId: bigint, moveIndex: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      throw new Error("Please connect your wallet");
    }
    try {
      const hash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "play",
        args: [gameId, moveIndex],
      });
      toast.info("Move submitted...");
      return hash;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to make move";
      toast.error(errorMsg);
      throw err;
    }
  };

  const forfeitGame = async (gameId: bigint) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      throw new Error("Please connect your wallet");
    }
    try {
      const hash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "forfeitGame",
        args: [gameId],
      });
      toast.info("Transaction submitted...");
      return hash;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to forfeit game";
      toast.error(errorMsg);
      throw err;
    }
  };

  // Challenge Functions
  const createChallenge = async (challenged: Address, betAmount: string, tokenAddress: Address = "0x0000000000000000000000000000000000000000" as Address) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      throw new Error("Please connect your wallet");
    }
    try {
      const betAmountWei = parseEther(betAmount);
      const hash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "createChallenge",
        args: [challenged, betAmountWei, tokenAddress],
        value: tokenAddress === "0x0000000000000000000000000000000000000000" ? betAmountWei : undefined,
      });
      toast.info("Transaction submitted...");
      return hash;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to create challenge";
      toast.error(errorMsg);
      throw err;
    }
  };

  const acceptChallenge = async (challengeId: bigint, moveIndex: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      throw new Error("Please connect your wallet");
    }
    try {
      // Get challenge to know bet amount
      const { createPublicClient, http } = await import("viem");
      const { baseSepolia } = await import("wagmi/chains");
      
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
      });

      const challenge = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "getChallenge",
        args: [challengeId],
      }) as {
        betAmount: bigint;
        tokenAddress: Address;
      } | null;
      
      if (!challenge) throw new Error("Challenge not found");
      
      const betAmount = challenge.betAmount;
      const tokenAddress = challenge.tokenAddress as Address;
      
      const hash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "acceptChallenge",
        args: [challengeId, moveIndex],
        value: tokenAddress === "0x0000000000000000000000000000000000000000" ? betAmount : undefined,
      });
      toast.info("Transaction submitted...");
      return hash;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to accept challenge";
      toast.error(errorMsg);
      throw err;
    }
  };

  // ============ READ HELPERS ============
  
  // These are used as hooks in components - see useGameData and useChallengeData hooks below
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getGame = async (_gameId: bigint) => {
    // This function signature is kept for compatibility
    // Components should use useReadContract directly or useGameData hook
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getChallenge = async (_challengeId: bigint) => {
    // This function signature is kept for compatibility
    // Components should use useReadContract directly or useChallengeData hook
    return null;
  };

  // Watch for transaction success
  useMemo(() => {
    if (isConfirmed) {
      toast.success("Transaction confirmed!");
    }
  }, [isConfirmed]);

  return {
    // State
    isConnected,
    address,
    isAdmin: isAdmin || (typeof owner === "string" && typeof address === "string" && owner.toLowerCase() === address.toLowerCase()),
    isOwner: typeof owner === "string" && typeof address === "string" && owner.toLowerCase() === address.toLowerCase(),
    player,
    moveTimeout,
    platformFeePercent,
    platformFeeRecipient,
    paused,
    owner,
    supportedTokens,
    latestGameId,
    
    // Loading states
    isPending,
    isConfirming,
    isConfirmed,
    error,
    
    // Admin functions
    addAdmin,
    removeAdmin,
    setMoveTimeout,
    setPlatformFee,
    setPlatformFeeRecipient,
    setSupportedToken,
    pause,
    unpause,
    
    // Player functions
    registerPlayer,
    
    // Game functions
    createGame,
    joinGame,
    play,
    forfeitGame,
    
    // Challenge functions
    createChallenge,
    acceptChallenge,
    
    // Read helpers
    getGame,
    getChallenge,
  };
}

