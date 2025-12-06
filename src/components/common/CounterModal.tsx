"use client";

import { X, Plus, Minus, RefreshCw, Loader2 } from "lucide-react";
import { useCounter } from "@/hooks/useCounter";

interface CounterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CounterModal({ isOpen, onClose }: CounterModalProps) {
  const { counter, increment, decrement, isPending, isConfirming, refetchCounter } = useCounter();

  if (!isOpen) return null;

  const isLoading = isPending || isConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl border border-white/10 p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <RefreshCw className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Test Counter</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Counter Display */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <p className="text-gray-400 text-sm mb-2">Current Counter Value</p>
            <p className="text-6xl font-bold text-white">{counter.toString()}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={decrement}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-all border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Minus className="w-5 h-5" />
                  <span>Decrement</span>
                </>
              )}
            </button>
            
            <button
              onClick={increment}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium transition-all border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Increment</span>
                </>
              )}
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refetchCounter()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Counter</span>
          </button>

          {/* Info Text */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-gray-300 text-sm">
              <strong className="text-blue-400">ℹ️ Temporary Test Feature</strong>
            </p>
            <p className="text-gray-300 text-sm mt-2">
              This is a temporary testing counter. Use increment and decrement to test contract interactions.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20 disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

