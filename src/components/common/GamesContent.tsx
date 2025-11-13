"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { GamesList, Game } from "@/components/games/GamesList";
import { Plus, RefreshCw, Loader2 } from "lucide-react";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "wagmi/chains";
import blocxtactoeAbi from "@/abi/blocxtactoeabi.json";
import { CONTRACT_ADDRESS } from "@/config/constants";
import { TabType } from "@/app/page";

interface GamesContentProps {
  onTabChange?: (tab: TabType) => void;
}

export function GamesContent({ onTabChange }: GamesContentProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useAccount();

  // Get latest game ID
  const { data: latestGameId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getLatestGameId",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadGameData = useCallback(async (gameId: bigint, publicClient: any): Promise<Game | null> => {
    try {
      const gameData = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "getGame",
        args: [gameId],
      }) as {
        playerOne: string;
        playerTwo: string;
        betAmount: bigint;
        status: number;
        winner: string;
        isPlayerOneTurn: boolean;
      };

      if (!gameData) return null;

      const { playerOne, playerTwo, betAmount, status, winner, isPlayerOneTurn } = gameData;
      
      let gameStatus: "waiting" | "active" | "finished" = "waiting";
      if (status === 1) { // Ended
        gameStatus = "finished";
      } else if (status === 2) { // Forfeited
        gameStatus = "finished";
      } else if (playerTwo && playerTwo !== "0x0000000000000000000000000000000000000000") {
        gameStatus = "active";
      }

      // Get time remaining for active games
      let timeRemaining: bigint | null = null;
      let canForfeit = false;
      if (gameStatus === "active") {
        try {
          timeRemaining = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: blocxtactoeAbi,
            functionName: "getTimeRemaining",
            args: [gameId],
          }) as bigint;
          canForfeit = timeRemaining === BigInt(0);
        } catch {
          // Game might be finished or invalid
        }
      }

      return {
        id: gameId.toString(),
        gameId,
        player1: playerOne as string,
        player2: playerTwo && playerTwo !== "0x0000000000000000000000000000000000000000" ? (playerTwo as string) : null,
        betAmount: betAmount as bigint,
        status: gameStatus,
        currentPlayer: isPlayerOneTurn ? (playerOne as string) : (playerTwo as string),
        winner: winner && winner !== "0x0000000000000000000000000000000000000000" ? (winner as string) : null,
        createdAt: new Date(),
        timeRemaining,
        canForfeit,
      } as Game;
    } catch {
      // Game might not exist yet
      return null;
    }
  }, []);

  const loadGames = useCallback(async () => {
    if (!latestGameId) return;
    
    setLoading(true);
    try {
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
      });

      const gameCount = Number(latestGameId);
      const gamePromises: Promise<Game | null>[] = [];
      
      // Load all games (up to latestGameId)
      for (let i = 0; i < gameCount; i++) {
        gamePromises.push(loadGameData(BigInt(i), publicClient));
      }
      
      const loadedGames = (await Promise.all(gamePromises)).filter((game): game is Game => game !== null);
      setGames(loadedGames);
    } catch (error) {
      console.error("Failed to load games:", error);
    } finally {
      setLoading(false);
    }
  }, [latestGameId, loadGameData]);

  useEffect(() => {
    if (latestGameId !== undefined) {
      loadGames();
    }
  }, [latestGameId, loadGames]);

  return (
    <div className="px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">All Games</h1>
            <p className="text-gray-400">Join existing games or create a new one</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadGames}
              disabled={loading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all border border-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => onTabChange?.("create")}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all border border-white/20"
            >
              <Plus className="w-4 h-4" />
              Create Game
            </button>
          </div>
        </div>

        {loading && games.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <GamesList games={games} loading={loading} />
        )}
      </div>
    </div>
  );
}

