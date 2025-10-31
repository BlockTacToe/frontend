"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Coins, Users, Play, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

export interface Game {
  id: string;
  gameId: bigint;
  player1: string;
  player2: string | null;
  betAmount: bigint;
  status: "waiting" | "active" | "finished";
  currentPlayer: string | null;
  winner: string | null;
  createdAt: Date;
}

interface GamesListProps {
  games: Game[];
  loading?: boolean;
}

export function GamesList({ games, loading = false }: GamesListProps) {
  const router = useRouter();
  const { address } = useAccount();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30";
      case "active":
        return "text-blue-400 bg-blue-400/20 border-blue-400/30";
      case "finished":
        return "text-green-400 bg-green-400/20 border-green-400/30";
      default:
        return "text-gray-400 bg-gray-400/20 border-gray-400/30";
    }
  };

  const canJoinGame = (game: Game) => {
    return game.status === "waiting" && game.player1.toLowerCase() !== address?.toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">No games available</div>
        <button
          onClick={() => router.push("/create")}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/50"
        >
          Create New Game
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <div
          key={game.id}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 hover:border-purple-400/40 transition-all shadow-lg hover:shadow-purple-500/20"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(game.status)}`}>
                  {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                </span>
                {game.player1.toLowerCase() === address?.toLowerCase() && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-400/30">
                    Your Game
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">
                    <span className="text-gray-400">Player 1: </span>
                    <span className="font-mono text-xs">
                      {game.player1.slice(0, 6)}...{game.player1.slice(-4)}
                    </span>
                  </span>
                </div>

                {game.player2 ? (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">
                      <span className="text-gray-400">Player 2: </span>
                      <span className="font-mono text-xs">
                        {game.player2.slice(0, 6)}...{game.player2.slice(-4)}
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Waiting for player 2</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-300">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">
                    <span className="text-gray-400">Bet: </span>
                    <span className="font-semibold text-yellow-400">{formatEther(game.betAmount)} ETH</span>
                  </span>
                </div>

                {game.winner && (
                  <div className="flex items-center gap-2 text-green-400">
                    <span className="text-sm font-medium">Winner: {game.winner.slice(0, 6)}...{game.winner.slice(-4)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {canJoinGame(game) ? (
                <button
                  onClick={() => router.push(`/play/${game.gameId.toString()}`)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-green-500/50"
                >
                  <Play className="w-4 h-4" />
                  Join Game
                </button>
              ) : game.status === "active" ? (
                <button
                  onClick={() => router.push(`/play/${game.gameId.toString()}`)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/50"
                >
                  <Play className="w-4 h-4" />
                  Play
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

