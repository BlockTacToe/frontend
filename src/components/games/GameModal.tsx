"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { GameBoard, BoardState, CellValue } from "@/components/games/GameBoard";
import { CountdownTimer } from "@/components/games/CountdownTimer";
import { ForfeitModal } from "@/components/games/ForfeitModal";
import { useBlOcXTacToe } from "@/hooks/useBlOcXTacToe";
import { useGameData } from "@/hooks/useGameData";
import { formatEther } from "viem";
import { Loader2, Coins, Users, AlertCircle, Clock, X } from "lucide-react";
import { toast } from "react-hot-toast";

type GameStatus = "waiting" | "active" | "finished";

interface GameModalProps {
  gameId: bigint;
  isOpen: boolean;
  onClose: () => void;
}

export function GameModal({ gameId, isOpen, onClose }: GameModalProps) {
  const { address, isConnected } = useAccount();
  const { play, joinGame, forfeitGame, isPending, isConfirming } = useBlOcXTacToe();

  // Get game data using hook
  const { game, timeRemaining } = useGameData(gameId);

  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [canJoin, setCanJoin] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [loadingGame, setLoadingGame] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [canForfeit, setCanForfeit] = useState(false);
  const [showForfeitModal, setShowForfeitModal] = useState(false);
  const [selectedJoinMove, setSelectedJoinMove] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setBoard(Array(9).fill(null));
      setGameStatus("waiting");
      setCanJoin(false);
      setIsPlayerTurn(false);
      setLoadingGame(true);
      setError(null);
      setWinningCells([]);
      setCanForfeit(false);
      setSelectedJoinMove(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (game) {
      updateGameState();
    }
  }, [game, isConnected, address]);

  useEffect(() => {
    if (timeRemaining !== undefined) {
      setCanForfeit(timeRemaining === BigInt(0));
    }
  }, [timeRemaining]);

  const updateGameState = () => {
    if (!game || !address || typeof game !== "object") return;
    if (!("playerOne" in game) || !("board" in game)) return;

    setLoadingGame(false);
    
    const { playerOne, playerTwo, betAmount, status, winner, board: gameBoard, isPlayerOneTurn } = game as {
      playerOne: string;
      playerTwo: string | null;
      betAmount: bigint;
      status: number;
      winner: string | null;
      board: number[];
      isPlayerOneTurn: boolean;
    };

    // Convert board from contract format (0=empty, 1=X, 2=O) to UI format
    const uiBoard: BoardState = gameBoard.map((cell: number) => {
      if (cell === 0) return null;
      return cell === 1 ? "X" : "O";
    });
    setBoard(uiBoard);

    // Determine game status
    let statusEnum: GameStatus = "waiting";
    if (status === 1) { // Ended
      statusEnum = "finished";
    } else if (status === 2) { // Forfeited
      statusEnum = "finished";
    } else if (playerTwo && playerTwo !== "0x0000000000000000000000000000000000000000") {
      statusEnum = "active";
    }
    setGameStatus(statusEnum);

    // Check if player can join
    if (statusEnum === "waiting" && address.toLowerCase() !== playerOne.toLowerCase()) {
      setCanJoin(true);
    } else {
      setCanJoin(false);
    }

    // Check if it's player's turn
    if (statusEnum === "active" && playerTwo) {
      const currentPlayer = isPlayerOneTurn ? playerOne : playerTwo;
      setIsPlayerTurn(address.toLowerCase() === currentPlayer.toLowerCase());
    } else {
      setIsPlayerTurn(false);
    }

    // Check for winner and winning cells
    if (winner && winner !== "0x0000000000000000000000000000000000000000") {
      // Find winning cells (simplified - in production, calculate from board)
      setWinningCells([]);
    }
  };

  const handleCellClick = async (index: number) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (gameStatus === "waiting" && canJoin) {
      // Join game
      if (selectedJoinMove === null) {
        setSelectedJoinMove(index);
        return;
      }
      try {
        await joinGame(gameId, selectedJoinMove);
        setSelectedJoinMove(null);
        toast.success("Joining game...");
      } catch (err: any) {
        toast.error(err?.message || "Failed to join game");
        setSelectedJoinMove(null);
      }
    } else if (gameStatus === "active" && isPlayerTurn) {
      // Make a move
      if (board[index] !== null) {
        toast.error("Cell is already occupied");
        return;
      }
      try {
        await play(gameId, index);
        toast.success("Move submitted...");
      } catch (err: any) {
        toast.error(err?.message || "Failed to make move");
      }
    }
  };

  const handleForfeit = async () => {
    try {
      await forfeitGame(gameId);
      setShowForfeitModal(false);
      toast.success("Forfeit transaction submitted...");
    } catch (err: any) {
      toast.error(err?.message || "Failed to forfeit game");
    }
  };

  if (!isOpen) return null;

  if (loadingGame || !game || typeof game !== "object" || !("playerOne" in game)) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50"
          onClick={onClose}
        />
        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-16 sm:pt-4 overflow-y-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
            </div>
          </div>
        </div>
      </>
    );
  }

  const { playerOne, playerTwo, betAmount, winner } = game as {
    playerOne: string;
    playerTwo: string | null;
    betAmount: bigint;
    winner: string | null;
  };
  const isPlayer1 = address?.toLowerCase() === playerOne.toLowerCase();
  const isPlayer2 = playerTwo && address?.toLowerCase() === playerTwo.toLowerCase();

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pt-16 sm:pt-4 overflow-y-auto">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl w-full my-auto relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20 z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>

          {/* Game Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/5 rounded-lg p-2 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 mb-0.5 sm:mb-1">
                <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Bet Amount</span>
              </div>
              <p className="text-white font-semibold text-sm sm:text-base md:text-lg">{formatEther(betAmount || BigInt(0))} ETH</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 mb-0.5 sm:mb-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Players</span>
              </div>
              <p className="text-white font-semibold text-sm sm:text-base">
                {playerTwo && playerTwo !== "0x0000000000000000000000000000000000000000" ? "2/2" : "1/2"}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-2 sm:p-3 md:p-4 border border-white/10">
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 mb-0.5 sm:mb-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Time Remaining</span>
              </div>
              {timeRemaining !== undefined && typeof timeRemaining === "bigint" && (
                <CountdownTimer timeRemaining={timeRemaining} />
              )}
            </div>
          </div>

          {/* Player Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <div className={`p-2 sm:p-3 md:p-4 rounded-lg border ${isPlayer1 ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10"}`}>
              <p className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Player 1 (X)</p>
              <p className="text-white font-mono text-xs sm:text-sm truncate">{playerOne.slice(0, 6)}...{playerOne.slice(-4)}</p>
              {isPlayer1 && <span className="text-[10px] sm:text-xs text-green-400 mt-0.5 sm:mt-1 block">You</span>}
            </div>
            {playerTwo && playerTwo !== "0x0000000000000000000000000000000000000000" ? (
              <div className={`p-2 sm:p-3 md:p-4 rounded-lg border ${isPlayer2 ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10"}`}>
                <p className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Player 2 (O)</p>
                <p className="text-white font-mono text-xs sm:text-sm truncate">{playerTwo.slice(0, 6)}...{playerTwo.slice(-4)}</p>
                {isPlayer2 && <span className="text-[10px] sm:text-xs text-green-400 mt-0.5 sm:mt-1 block">You</span>}
              </div>
            ) : (
              <div className="p-2 sm:p-3 md:p-4 rounded-lg border border-white/10 bg-white/5">
                <p className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Player 2 (O)</p>
                <p className="text-gray-500 text-xs sm:text-sm">Waiting for player...</p>
              </div>
            )}
          </div>

          {/* Game Status */}
          {gameStatus === "finished" && winner && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-400 font-semibold text-sm sm:text-base">
                {winner.toLowerCase() === address?.toLowerCase() ? "🎉 You Won!" : "Game Over"}
              </p>
            </div>
          )}

          {gameStatus === "waiting" && canJoin && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">Select your first move to join this game</p>
              {selectedJoinMove !== null && (
                <p className="text-xs sm:text-sm text-blue-300">Selected cell: {selectedJoinMove}</p>
              )}
            </div>
          )}

          {gameStatus === "active" && isPlayerTurn && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 font-semibold text-xs sm:text-sm md:text-base">Your turn! Make a move.</p>
            </div>
          )}

          {gameStatus === "active" && !isPlayerTurn && playerTwo && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-500/20 border border-gray-500/30 rounded-lg">
              <p className="text-gray-400 text-xs sm:text-sm md:text-base">Waiting for opponent's move...</p>
            </div>
          )}

          {/* Game Board */}
          <div className="mb-4 sm:mb-6">
            <GameBoard
              board={board}
              onCellClick={handleCellClick}
              disabled={gameStatus === "finished" || (gameStatus === "active" && !isPlayerTurn) || (gameStatus === "waiting" && !canJoin)}
              winner={winner && winner !== "0x0000000000000000000000000000000000000000" ? (isPlayer1 ? "X" : "O") : null}
              winningCells={winningCells}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3">
            {gameStatus === "active" && canForfeit && (
              <button
                onClick={() => setShowForfeitModal(true)}
                className="px-4 sm:px-6 py-1.5 sm:py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all text-xs sm:text-sm md:text-base"
              >
                Forfeit Game
              </button>
            )}
          </div>

          {error && (
            <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs sm:text-sm">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}
        </div>
      </div>

      <ForfeitModal
        isOpen={showForfeitModal}
        onClose={() => setShowForfeitModal(false)}
        onConfirm={handleForfeit}
        gameId={gameId.toString()}
        isLoading={isPending || isConfirming}
      />
    </>
  );
}

