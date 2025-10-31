"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useGame } from "@/hooks/useGame";
import { Loader2, Coins, AlertCircle } from "lucide-react";

export default function CreateGamePage() {
  const [betAmount, setBetAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useAccount();
  const { createGame, loading } = useGame();
  const router = useRouter();

  if (!isConnected) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!betAmount || parseFloat(betAmount) <= 0) {
      setError("Please enter a valid bet amount greater than 0");
      return;
    }

    try {
      const gameId = await createGame(betAmount);
      if (gameId) {
        router.push(`/play/${gameId.toString()}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create game");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create New Game</h1>
            <p className="text-gray-400">Set your bet amount and challenge other players</p>
            {!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" ? (
              <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">🎮 <strong>Simulation Mode</strong> - No contract configured. Playing in demo mode.</p>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="betAmount" className="block text-sm font-medium text-gray-300 mb-2">
                Bet Amount (ETH)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Coins className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  id="betAmount"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.01"
                  className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Both players must pay this amount. Winner takes all.
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
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
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

