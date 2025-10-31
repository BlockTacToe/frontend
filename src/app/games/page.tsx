"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { GamesList, Game } from "@/components/GamesList";
import { useGame } from "@/hooks/useGame";
import { Plus, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useAccount();
  const { getAllGames, getGame } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }
    loadGames();
  }, [isConnected, router]);

  const loadGames = async () => {
    if (!isConnected) return;
    
    setLoading(true);
    try {
      const gameIds = await getAllGames();
      const gamePromises = gameIds.map(async (gameId: bigint) => {
        try {
          const gameData = await getGame(gameId);
          // Parse game data based on contract return format
          // [player1, player2, betAmount, status, currentPlayer, isFinished]
          const [player1, player2, betAmount, statusNum, currentPlayer, isFinished] = gameData;
          
          let status: "waiting" | "active" | "finished" = "waiting";
          if (isFinished) {
            status = "finished";
          } else if (player2 && player2 !== "0x0000000000000000000000000000000000000000") {
            status = "active";
          }

          return {
            id: gameId.toString(),
            gameId,
            player1: player1 as string,
            player2: player2 && player2 !== "0x0000000000000000000000000000000000000000" ? (player2 as string) : null,
            betAmount: betAmount as bigint,
            status,
            currentPlayer: currentPlayer && currentPlayer !== "0x0000000000000000000000000000000000000000" ? (currentPlayer as string) : null,
            winner: null, // TODO: Get winner from contract
            createdAt: new Date(),
          } as Game;
        } catch (error) {
          console.error(`Failed to load game ${gameId}:`, error);
          return null;
        }
      });

      const loadedGames = (await Promise.all(gamePromises)).filter((game): game is Game => game !== null);
      setGames(loadedGames);
    } catch (error: any) {
      console.error("Failed to load games:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">All Games</h1>
            <p className="text-gray-400">Join existing games or create a new one</p>
            {!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" ? (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <span className="text-blue-400 text-xs">🎮 Simulation Mode</span>
              </div>
            ) : null}
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadGames}
              disabled={loading}
              className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-white px-4 py-2 rounded-lg font-medium transition-all border border-purple-500/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/create"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/50"
            >
              <Plus className="w-4 h-4" />
              Create Game
            </Link>
          </div>
        </div>

        {loading && games.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : (
          <GamesList games={games} loading={loading} />
        )}
      </div>
    </div>
  );
}

