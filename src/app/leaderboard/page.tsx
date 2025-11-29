"use client";

import { Trophy, Medal, Award } from "lucide-react";
import { useLeaderboard } from "@/hooks/useGameData";
import { formatEther } from "viem";
import { Loader2 } from "lucide-react";

export default function LeaderboardPage() {
  const { leaderboard, isLoading, error } = useLeaderboard(100);

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
            <p className="text-gray-300 text-lg">Top players ranked by ELO rating</p>
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
          <p className="text-gray-300 text-lg">Top players ranked by ELO rating</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8">
          {!leaderboard || !Array.isArray(leaderboard) || leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No players on the leaderboard yet.</p>
              <p className="text-gray-500 text-sm mt-2">Be the first to play and win!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((player, index) => {
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
                        <p className="text-gray-400 text-sm mt-1">
                          {Number(player.wins)}W
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-white" />
                      <span className="text-white font-bold text-lg">{Number(player.rating)}</span>
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
