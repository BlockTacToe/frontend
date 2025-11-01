"use client";

import { X, AlertTriangle } from "lucide-react";

interface ForfeitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gameId: string;
  isLoading?: boolean;
}

export function ForfeitModal({
  isOpen,
  onClose,
  onConfirm,
  gameId,
  isLoading = false,
}: ForfeitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-red-500/30 p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Forfeit Game</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to forfeit game <span className="font-mono text-white">#{gameId}</span>?
          </p>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">
              <strong>⚠️ Warning:</strong> This action will end the game. If your opponent has timed out, 
              you will win both players' ETH bets.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Confirm Forfeit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

