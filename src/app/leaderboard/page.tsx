"use client";

import { Trophy, Medal, Award } from "lucide-react";
import { useLeaderboard } from "@/hooks/useGameData";
import { formatEther } from "viem";
import { Loader2 } from "lucide-react";

export default function LeaderboardPage() {
  const { leaderboard, isLoading, error } = useLeaderboard(100);

  // Sort leaderboard by wins (descending), then by address for consistency
  const sortedLeaderboard = leaderboard && Array.isArray(leaderboard) 
    ? [...leaderboard].sort((a, b) => {
        // Primary sort: by wins (descending)
        const winsA = Number(a.wins || 0);
        const winsB = Number(b.wins || 0);
        if (winsB !== winsA) {
          return winsB - winsA;
        }
        
        // Secondary sort: by address for consistency
        return a.player.localeCompare(b.player);
      })
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-white" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Leaderboard</h1>
            </div>
            <p className="text-gray-300 text-lg">Top players ranked by number of wins</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
            <div className="text-center py-12">
              <p className="text-yellow-400 mb-4">Unable to load leaderboard</p>
              <p className="text-gray-400 text-sm mb-4">This may be due to network issues or the leaderboard being empty.</p>
              <p className="text-gray-500 text-sm">Please try refreshing the page or check back later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 md:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-gray-300 text-lg">Top players ranked by number of wins</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          {!sortedLeaderboard || sortedLeaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No players on the leaderboard yet.</p>
              <p className="text-gray-500 text-sm mt-2">Be the first to play and win!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedLeaderboard.map((player, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={player.player}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20">
                        {rank === 1 && <Medal className="w-6 h-6 text-yellow-400" />}
                        {rank === 2 && <Medal className="w-6 h-6 text-gray-300" />}
                        {rank === 3 && <Medal className="w-6 h-6 text-orange-400" />}
                        {rank > 3 && <span className="text-white font-bold">{rank}</span>}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {player.username || `${player.player.slice(0, 6)}...${player.player.slice(-4)}`}
                        </p>
                        <p className="text-gray-400 text-sm font-mono">
                          {player.player.slice(0, 10)}...{player.player.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-bold text-lg">{Number(player.wins)}</span>
                      <span className="text-gray-400 text-sm">wins</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
