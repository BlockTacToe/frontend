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
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
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
            className="block w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading || !searchUsername.trim()}
          className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium transition-all border border-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>

      {isLoading && searchUsername && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Searching...</span>
        </div>
      )}

      {playerAddress && player && !isLoading && (
        <div className="bg-white/5 rounded-lg border border-white/10 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-white font-medium">
                  {typeof player === "object" && "username" in player ? (player.username as string) : searchUsername}
                </p>
                <p className="text-gray-400 text-sm font-mono">
                  {playerAddress.slice(0, 10)}...{playerAddress.slice(-8)}
                </p>
              </div>
            </div>
            {onPlayerSelect && (
              <button
                onClick={handleSelect}
                className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-medium transition-all border border-orange-500/30"
              >
                Select
              </button>
            )}
          </div>
        </div>
      )}

      {!playerAddress && !isLoading && searchUsername && (
        <div className="text-center py-2">
          <p className="text-gray-400 text-sm">Player not found</p>
        </div>
      )}
    </div>
  );
}

