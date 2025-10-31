"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Play, Plus, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-20">
      <div className="max-w-6xl w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            BlockTacToe
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Play Tic-Tac-Toe on the blockchain. Win crypto. Play fair.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            {isConnected ? (
              <>
                <Link
                  href="/games"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70"
                >
                  <Play className="w-5 h-5" />
                  View Games
                </Link>
                <Link
                  href="/create"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
                >
                  <Plus className="w-5 h-5" />
                  Create Game
                </Link>
              </>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-gray-400">Connect your wallet to start playing</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 hover:border-purple-400/40 transition-all shadow-lg hover:shadow-purple-500/20">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Instant Play</h3>
            <p className="text-gray-400">
              Create or join games instantly. No waiting, no queues. Just pure gaming fun.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 hover:border-purple-400/40 transition-all shadow-lg hover:shadow-purple-500/20">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Crypto Rewards</h3>
            <p className="text-gray-400">
              Win ETH by outsmarting your opponents. Fair play guaranteed by smart contracts.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6 hover:border-purple-400/40 transition-all shadow-lg hover:shadow-purple-500/20">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
              <Play className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Decentralized</h3>
            <p className="text-gray-400">
              Powered by blockchain. Your moves are transparent and verifiable on-chain.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Connect Wallet", desc: "Link your Web3 wallet" },
              { step: "2", title: "Create or Join", desc: "Start a game or join existing one" },
              { step: "3", title: "Place Bet", desc: "Set your bet amount in ETH" },
              { step: "4", title: "Play & Win", desc: "Make moves and claim victory" },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
