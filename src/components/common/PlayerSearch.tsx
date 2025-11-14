"use client";

import { useState } from "react";
import { usePlayerByUsername } from "@/hooks/useGameData";
import { Search, User, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Address } from "viem";

interface PlayerSearchProps {
  onPlayerSelect?: (address: Address, username: string) => void;
  placeholder?: string;
}

export function PlayerSearch({ onPlayerSelect, placeholder = "Search by username..." }: PlayerSearchProps) {
  const [searchUsername, setSearchUsername] = useState("");
  const { playerAddress, player, isLoading } = usePlayerByUsername(searchUsername || undefined);

  const handleSearch = () => {
    if (!searchUsername.trim()) {
      toast.error("Please enter a username");
      return;
    }
    // The hook will automatically fetch when searchUsername changes
  };

  const handleSelect = () => {
    if (playerAddress && player && typeof player === "object" && "username" in player) {
      const username = typeof player.username === "string" ? player.username : searchUsername;
      onPlayerSelect?.(playerAddress, username);
      toast.success(`Selected: ${username}`);
    }
  };

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <div className="flex gap-1.5 sm:gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder={placeholder}
            className="block w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all text-sm sm:text-base"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading || !searchUsername.trim()}
          className="px-2 sm:px-4 py-1.5 sm:py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium transition-all border border-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isLoading ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Search className="w-3 h-3 sm:w-4 sm:h-4" />}
        </button>
      </div>

      {isLoading && searchUsername && (
        <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm">
          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
          <span>Searching...</span>
        </div>
      )}

      {playerAddress && player && !isLoading && (
        <div className="bg-white/5 rounded-lg border border-white/10 p-2 sm:p-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm sm:text-base truncate">
                  {typeof player === "object" && "username" in player ? (player.username as string) : searchUsername}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm font-mono truncate hidden sm:block">
                  {playerAddress.slice(0, 10)}...{playerAddress.slice(-8)}
                </p>
              </div>
            </div>
            {onPlayerSelect && (
              <button
                onClick={handleSelect}
                className="px-2 sm:px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-xs sm:text-sm font-medium transition-all border border-orange-500/30 flex-shrink-0"
              >
                Select
              </button>
            )}
          </div>
        </div>
      )}

      {!playerAddress && !isLoading && searchUsername && (
        <div className="text-center py-1.5 sm:py-2">
          <p className="text-gray-400 text-xs sm:text-sm">Player not found</p>
        </div>
      )}
    </div>
  );
}

