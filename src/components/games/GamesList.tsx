"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Coins, Users, Play, Loader2, AlertTriangle } from "lucide-react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { CountdownTimer } from "./CountdownTimer";

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
  timeRemaining?: bigint | null;
  canForfeit?: boolean;
}

interface GamesListProps {
  games: Game[];
  loading?: boolean;
  onGameClick?: (gameId: bigint) => void;
}

export function GamesList({ games, loading = false, onGameClick }: GamesListProps) {
  const router = useRouter();
  const { address } = useAccount();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "text-gray-300 bg-white/5 border-white/10";
      case "active":
        return "text-blue-500 bg-blue-500/10 border-blue-500/30";
      case "finished":
        return "text-gray-400 bg-white/5 border-white/10";
      default:
        return "text-gray-400 bg-white/5 border-white/10";
    }
  };

  const canJoinGame = (game: Game) => {
    return game.status === "waiting" && game.player1.toLowerCase() !== address?.toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-300 text-lg mb-4">No games available</div>
        <button
          onClick={() => router.push("/create")}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all border border-white/20"
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
          className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(game.status)}`}>
                  {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                </span>
                {game.player1.toLowerCase() === address?.toLowerCase() && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-white border border-white/20">
                    Your Game
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    <span className="text-gray-400">Player 1: </span>
                    <span className="font-mono text-xs text-white">
                      {game.player1.slice(0, 6)}...{game.player1.slice(-4)}
                    </span>
                  </span>
                </div>

                {game.player2 ? (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      <span className="text-gray-400">Player 2: </span>
                      <span className="font-mono text-xs text-white">
                        {game.player2.slice(0, 6)}...{game.player2.slice(-4)}
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Waiting for player 2</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-300">
                  <Coins className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    <span className="text-gray-400">Bet: </span>
                    <span className="font-semibold text-white">{formatEther(game.betAmount)} ETH</span>
                  </span>
                </div>

                {game.winner && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-sm font-medium">Winner: <span className="text-orange-500">{game.winner.slice(0, 6)}...{game.winner.slice(-4)}</span></span>
                  </div>
                )}

                {game.status === "active" && game.timeRemaining !== undefined && (
                  <div className="flex items-center gap-2">
                    {game.timeRemaining !== null ? (
                      <>
                        <CountdownTimer 
                          timeRemaining={game.timeRemaining} 
                          warningThreshold={3600}
                        />
                        {game.canForfeit && game.currentPlayer?.toLowerCase() !== address?.toLowerCase() && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Can Forfeit
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Loading time...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {canJoinGame(game) ? (
                <button
                  onClick={() => onGameClick ? onGameClick(game.gameId) : router.push(`/play/${game.gameId.toString()}`)}
                  className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-medium transition-all border border-blue-500/30"
                >
                  <Play className="w-4 h-4" />
                  Join Game
                </button>
              ) : game.status === "active" ? (
                <button
                  onClick={() => onGameClick ? onGameClick(game.gameId) : router.push(`/play/${game.gameId.toString()}`)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all border border-white/20"
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

