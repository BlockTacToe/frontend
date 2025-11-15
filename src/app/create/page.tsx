"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useBlOcXTacToe } from "@/hooks/useBlOcXTacToe";
import { usePlayerData } from "@/hooks/useGameData";
import { Loader2, Coins, AlertCircle, Grid3x3 } from "lucide-react";
import { toast } from "react-hot-toast";
import { usePublicClient } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { CONTRACT_ADDRESS } from "@/config/constants";
import { waitForTransactionReceipt } from "viem/actions";

export default function CreateGamePage() {
  const [betAmount, setBetAmount] = useState("");
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, address } = useAccount();
  const { createGame, isPending, isConfirming, isConfirmed, player, registerPlayer, hash, error: contractError } = useBlOcXTacToe();
  const router = useRouter();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const [isRegistering, setIsRegistering] = useState(false);

  // Watch for registration confirmation
  useEffect(() => {
    if (isConfirmed && isRegistering && hash) {
      // Small delay to ensure transaction is fully processed
      setTimeout(() => {
        // Invalidate player data queries to refresh registration status
        queryClient.invalidateQueries({
          queryKey: ["readContract", { address: CONTRACT_ADDRESS }],
        });
        
        toast.success("Registration successful!");
        setIsRegistering(false);
      }, 1000);
    }
  }, [isConfirmed, isRegistering, hash, queryClient]);

  // Also watch for errors and reset state
  useEffect(() => {
    if (contractError && isRegistering) {
      setIsRegistering(false);
    }
  }, [contractError, isRegistering]);

  // Check if player is registered
  const { player: playerData } = usePlayerData(address);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }
  }, [isConnected, router]);

  // Check registration status
  const isRegistered = 
    (playerData && typeof playerData === "object" && "registered" in playerData && playerData.registered) ||
    (player && typeof player === "object" && "registered" in player && player.registered) ||
    false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!betAmount || parseFloat(betAmount) <= 0) {
      setError("Please enter a valid bet amount greater than 0");
      return;
    }

    if (selectedMove === null) {
      setError("Please select your first move");
      return;
    }

    if (!isRegistered) {
      setError("Please register as a player first");
      return;
    }

    try {
      const hash = await createGame(betAmount, selectedMove);
      if (hash && publicClient) {
        // Waiting for confirmation - toast removed per user request
        const receipt = await waitForTransactionReceipt(publicClient, { hash: hash as `0x${string}` });
        
        // Decode GameCreated event to get gameId
        const blocxtactoeAbiArtifact = await import("@/abi/blocxtactoeabi.json");
        const blocxtactoeAbi = (blocxtactoeAbiArtifact as unknown as { abi: unknown[] }).abi;
        const { decodeEventLog } = await import("viem");
        
        let gameId: bigint | null = null;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: blocxtactoeAbi,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "GameCreated" && decoded.args && "gameId" in decoded.args) {
              gameId = decoded.args.gameId as bigint;
              break;
            }
          } catch {
            // Not the event we're looking for
          }
        }

        if (gameId !== null) {
          toast.success("Game created successfully!");
          router.push(`/play/${gameId.toString()}`);
        } else {
          toast.success("Game created! Redirecting to games...");
          router.push("/games");
        }
      }
    } catch (err: any) {
      const errorMessage = err?.message || err?.shortMessage || "Failed to create game";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRegister = async () => {
    const username = prompt("Enter your username (max 32 characters):");
    if (!username || username.length === 0 || username.length > 32) {
      toast.error("Username must be between 1 and 32 characters");
      return;
    }
    
    try {
      setIsRegistering(true);
      await registerPlayer(username);
      // The useEffect will handle the confirmation and cleanup
    } catch (err: any) {
      toast.error(err?.message || "Failed to register");
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create New Game</h1>
            <p className="text-gray-400">Set your bet amount and make your first move</p>
          </div>

          {!isRegistered && (
            <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm mb-3">
                Register username to create and join games.
              </p>
              <button
                onClick={handleRegister}
                disabled={isPending || isConfirming}
                className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg border border-yellow-500/30 transition-all disabled:opacity-50"
              >
                Register Player Username
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="betAmount" className="block text-sm font-medium text-gray-300 mb-2">
                Bet Amount (ETH)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Coins className="h-5 w-5 text-white" />
                </div>
                <input
                  id="betAmount"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.01"
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                  required
                  disabled={!isRegistered}
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Both players must pay this amount. Winner takes all.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Your First Move
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedMove(index)}
                    disabled={!isRegistered}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg border-2 transition-all
                      ${selectedMove === index
                        ? "bg-white/20 border-white text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    <span className="text-xl font-bold text-blue-500">X</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Click a cell to place your first X move
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || isConfirming || !isRegistered}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-all border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Game...
                </>
              ) : (
                "Create Game"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
