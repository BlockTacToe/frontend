"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { GamesList, Game } from "@/components/games/GamesList";
import { GameModal } from "@/components/games/GameModal";
import { Plus, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "wagmi/chains";
import blocxtactoeAbi from "@/abi/blocxtactoeabi.json";
import { CONTRACT_ADDRESS } from "@/config/constants";
import { TabType } from "@/app/page";

interface GamesContentProps {
  onTabChange?: (tab: TabType) => void;
}

export function GamesContent({ onTabChange }: GamesContentProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState<bigint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showActiveGames, setShowActiveGames] = useState(false);
  const [showPastGames, setShowPastGames] = useState(false);
  const { isConnected } = useAccount();

  // Get latest game ID
  const { data: latestGameId } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getLatestGameId",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadGameData = useCallback(async (gameId: bigint, publicClient: any): Promise<Game | null> => {
    try {
      const gameData = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "getGame",
        args: [gameId],
      }) as {
        playerOne: string;
        playerTwo: string;
        betAmount: bigint;
        status: number;
        winner: string;
        isPlayerOneTurn: boolean;
      };

      if (!gameData) return null;

      const { playerOne, playerTwo, betAmount, status, winner, isPlayerOneTurn } = gameData;
      
      let gameStatus: "waiting" | "active" | "finished" = "waiting";
      if (status === 1) { // Ended
        gameStatus = "finished";
      } else if (status === 2) { // Forfeited
        gameStatus = "finished";
      } else if (playerTwo && playerTwo !== "0x0000000000000000000000000000000000000000") {
        gameStatus = "active";
      }

      // Get time remaining for active games
      let timeRemaining: bigint | null = null;
      let canForfeit = false;
      if (gameStatus === "active") {
        try {
          timeRemaining = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: blocxtactoeAbi,
            functionName: "getTimeRemaining",
            args: [gameId],
          }) as bigint;
          canForfeit = timeRemaining === BigInt(0);
        } catch {
          // Game might be finished or invalid
        }
      }

      return {
        id: gameId.toString(),
        gameId,
        player1: playerOne as string,
        player2: playerTwo && playerTwo !== "0x0000000000000000000000000000000000000000" ? (playerTwo as string) : null,
        betAmount: betAmount as bigint,
        status: gameStatus,
        currentPlayer: isPlayerOneTurn ? (playerOne as string) : (playerTwo as string),
        winner: winner && winner !== "0x0000000000000000000000000000000000000000" ? (winner as string) : null,
        createdAt: new Date(),
        timeRemaining,
        canForfeit,
      } as Game;
    } catch {
      // Game might not exist yet
      return null;
    }
  }, []);

  const loadGames = useCallback(async () => {
    if (!latestGameId) return;
    
    setLoading(true);
    try {
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
      });

      const gameCount = Number(latestGameId);
      const gamePromises: Promise<Game | null>[] = [];
      
      // Load all games (up to latestGameId)
      for (let i = 0; i < gameCount; i++) {
        gamePromises.push(loadGameData(BigInt(i), publicClient));
      }
      
      const loadedGames = (await Promise.all(gamePromises)).filter((game): game is Game => game !== null);
      setGames(loadedGames);
    } catch (error) {
      console.error("Failed to load games:", error);
    } finally {
      setLoading(false);
    }
  }, [latestGameId, loadGameData]);

  useEffect(() => {
    if (latestGameId !== undefined) {
      loadGames();
    }
  }, [latestGameId, loadGames]);

  const handleGameClick = (gameId: bigint) => {
    setSelectedGameId(gameId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGameId(null);
  };

  return (
    <>
      <div className="px-2 sm:px-4 py-4 sm:py-6 md:px-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">All Games</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-400">Join existing games or create a new one</p>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={loadGames}
                disabled={loading}
                className="flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all border border-white/20 disabled:opacity-50 text-xs sm:text-sm"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => onTabChange?.("create")}
                className="flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all border border-white/20 text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Create Game</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>

          {loading && games.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : (
            <>
              {/* Waiting Games (Always Visible) */}
              {games.filter(g => g.status === "waiting").length > 0 && (
                <GamesList 
                  games={games.filter(g => g.status === "waiting")} 
                  loading={loading} 
                  onGameClick={handleGameClick} 
                />
              )}
              
              {/* Active Games Section */}
              {games.filter(g => g.status === "active").length > 0 && (
                <div className={games.filter(g => g.status === "waiting").length > 0 ? "mt-6 sm:mt-8" : ""}>
                  <button
                    onClick={() => setShowActiveGames(!showActiveGames)}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
                  >
                    {showActiveGames ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                    <span className="text-lg sm:text-xl font-semibold">
                      Active Games ({games.filter(g => g.status === "active").length})
                    </span>
                  </button>
                  
                  {showActiveGames && (
                    <GamesList 
                      games={games.filter(g => g.status === "active")} 
                      loading={false} 
                      onGameClick={handleGameClick} 
                    />
                  )}
                </div>
              )}
              
              {/* Past Games Section */}
              {games.filter(g => g.status === "finished").length > 0 && (
                <div className="mt-6 sm:mt-8">
                  <button
                    onClick={() => setShowPastGames(!showPastGames)}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
                  >
                    {showPastGames ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                    <span className="text-lg sm:text-xl font-semibold">
                      Past Games ({games.filter(g => g.status === "finished").length})
                    </span>
                  </button>
                  
                  {showPastGames && (
                    <GamesList 
                      games={games.filter(g => g.status === "finished")} 
                      loading={false} 
                      onGameClick={handleGameClick} 
                    />
                  )}
                </div>
              )}
              
              {/* Show message if no games at all */}
              {games.filter(g => g.status === "waiting").length === 0 && 
               games.filter(g => g.status === "active").length === 0 && 
               games.filter(g => g.status === "finished").length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-300 text-lg mb-4">No games available</div>
                  <button
                    onClick={() => onTabChange?.("create")}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all border border-white/20"
                  >
                    Create New Game
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedGameId !== null && (
        <GameModal
          gameId={selectedGameId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

