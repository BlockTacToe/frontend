"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useBlOcXTacToe } from '@/hooks/useBlOcXTacToe';
import { usePlayerData } from '@/hooks/useGameData';
import { GameBoard } from './games/GameBoard';
import { GamesList } from './games/GamesList';
import { useGamesList } from '@/hooks/useGamesList';
import { useLeaderboard } from '@/hooks/useGameData';
import { Grid3x3, Trophy, Play, Plus, TrendingUp, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { formatEther } from 'viem';

export default function BlockTacToeDashboard() {
  const { address, isConnected } = useAccount();
  const { player } = useBlOcXTacToe();
  const { player: playerData } = usePlayerData(address);
  const { games, loading: gamesLoading } = useGamesList();
  const { leaderboard, isLoading: leaderboardLoading } = useLeaderboard(10);
  const [activeTab, setActiveTab] = useState('games');

  const isRegistered = 
    (playerData && typeof playerData === "object" && "registered" in playerData && playerData.registered) ||
    (player && typeof player === "object" && "registered" in player && player.registered) ||
    false;

  if (!isConnected) {
    return (
      <div className="text-center py-12 md:py-20 px-4">
        <div className="text-4xl md:text-6xl mb-4">🎮</div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Welcome to BlOcXTacToe</h2>
        <p className="text-sm md:text-base text-gray-300">Connect your wallet to start playing!</p>
      </div>
    );
  }

  // Convert games map to array for GamesList
  const gamesArray = Array.from(games.values()).map((game, index) => ({
    id: index.toString(),
    gameId: BigInt(index),
    player1: game.playerOne,
    player2: game.playerTwo && game.playerTwo !== "0x0000000000000000000000000000000000000000" ? game.playerTwo : null,
    betAmount: game.betAmount,
    status: game.status === 0 ? (game.playerTwo && game.playerTwo !== "0x0000000000000000000000000000000000000000" ? "active" : "waiting") : "finished" as "waiting" | "active" | "finished",
    currentPlayer: game.isPlayerOneTurn ? game.playerOne : (game.playerTwo || null),
    winner: game.winner && game.winner !== "0x0000000000000000000000000000000000000000" ? game.winner : null,
    createdAt: new Date(),
  }));

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Welcome Section */}
      <div className="text-center py-8 md:py-14 px-4 mt-4 md:mt-6 mb-6 md:mb-10">
        <div className="text-3xl md:text-4xl mb-4">🎮</div>
        <h1 className="text-2xl md:text-4xl font-bold mb-4">
          <span className="text-orange-500">BLOC</span>
          <span className="text-blue-500">X</span>
          <span className="text-white">TacToe</span>
        </h1>
        <p className="text-base md:text-xl text-gray-300 mb-4 md:mb-6">
          Decentralized Tic Tac Toe on Base Mainnet
        </p>
        {isRegistered && playerData && typeof playerData === "object" && "username" in playerData && (
          <div className="flex justify-center items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>@{playerData.username}</span>
            {typeof playerData.wins === "bigint" && (
              <span className="text-orange-500">• {Number(playerData.wins)} Wins</span>
            )}
            {typeof playerData.rating === "bigint" && (
              <span className="text-blue-500">• Rating: {Number(playerData.rating)}</span>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-6 md:mb-8 px-2">
        <div className="flex flex-wrap justify-center space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
          {[
            { 
              id: 'games', 
              label: 'Games', 
              icon: Grid3x3 
            },
            { 
              id: 'leaderboard', 
              label: 'Leaderboard', 
              icon: Trophy 
            },
            { 
              id: 'activity', 
              label: 'Activity', 
              icon: TrendingUp 
            },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 md:px-6 py-2 md:py-3 rounded-md transition-colors font-medium text-xs md:text-sm relative group ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
                title={tab.label}
              >
                <div className="md:hidden">
                  <IconComponent className="text-lg" />
                </div>
                <div className="hidden md:block">
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-2 md:px-4 pb-6 md:pb-8 overflow-x-hidden">
        {activeTab === 'games' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">All Games</h2>
                <p className="text-gray-400">Join existing games or create a new one</p>
              </div>
              <Link
                href="/create"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all border border-white/20"
              >
                <Plus className="w-4 h-4" />
                Create Game
              </Link>
            </div>
            <GamesList games={gamesArray} loading={gamesLoading} />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 md:p-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Leaderboard</h2>
              </div>
              {leaderboardLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
              ) : !leaderboard || !Array.isArray(leaderboard) || leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No players on the leaderboard yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((player, index) => {
                    const rank = index + 1;
                    return (
                      <div
                        key={player.player}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20">
                            {rank === 1 && <span className="text-yellow-400 text-lg">🥇</span>}
                            {rank === 2 && <span className="text-gray-300 text-lg">🥈</span>}
                            {rank === 3 && <span className="text-orange-400 text-lg">🥉</span>}
                            {rank > 3 && <span className="text-white font-bold">{rank}</span>}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {player.username || `${player.player.slice(0, 6)}...${player.player.slice(-4)}`}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {Number(player.wins)} Wins
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-lg">{Number(player.rating)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 md:p-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Activity</h2>
              </div>
              <div className="text-center py-12">
                <p className="text-gray-400">Activity feed coming soon. Check the Games tab for active games!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


