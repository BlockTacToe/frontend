"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { GameBoard, BoardState, CellValue } from "@/components/GameBoard";
import { useGame } from "@/hooks/useGame";
import { formatEther } from "viem";
import { Loader2, Coins, Users, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

type GameStatus = "waiting" | "active" | "finished";

export default function PlayGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = BigInt(params.gameId as string);
  const { address, isConnected } = useAccount();
  const { joinGame, makeMove, getGame, getGameBoard, loading } = useGame();

  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [player1, setPlayer1] = useState<string | null>(null);
  const [player2, setPlayer2] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<bigint>(0n);
  const [winner, setWinner] = useState<string | null>(null);
  const [canJoin, setCanJoin] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [loadingGame, setLoadingGame] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winningCells, setWinningCells] = useState<number[]>([]);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
      return;
    }
    loadGameData();
    const interval = setInterval(loadGameData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [gameId, isConnected, router]);

  const loadGameData = async () => {
    try {
      const [gameData, boardData] = await Promise.all([
        getGame(gameId),
        getGameBoard(gameId),
      ]);

      // Parse game data
      const [p1, p2, bet, statusNum, currPlayer, isFinished] = gameData;
      setPlayer1(p1 as string);
      setPlayer2(
        p2 && p2 !== "0x0000000000000000000000000000000000000000"
          ? (p2 as string)
          : null
      );
      setBetAmount(bet as bigint);
      setCurrentPlayer(
        currPlayer && currPlayer !== "0x0000000000000000000000000000000000000000"
          ? (currPlayer as string)
          : null
      );

      // Determine game status
      let status: GameStatus = "waiting";
      if (isFinished) {
        status = "finished";
        // TODO: Get winner from contract
      } else if (p2 && p2 !== "0x0000000000000000000000000000000000000000") {
        status = "active";
      }
      setGameStatus(status);

      // Check if player can join
      if (status === "waiting" && address && address.toLowerCase() !== (p1 as string).toLowerCase()) {
        setCanJoin(true);
      } else {
        setCanJoin(false);
      }

      // Check if it's player's turn
      if (status === "active" && address && currPlayer) {
        setIsPlayerTurn(
          address.toLowerCase() === (currPlayer as string).toLowerCase()
        );
      } else {
        setIsPlayerTurn(false);
      }

      // Parse board data
      const boardArray: BoardState = (boardData as any[]).map((cell: number) => {
        if (cell === 1) return "X";
        if (cell === 2) return "O";
        return null;
      });
      setBoard(boardArray);

      // Check for winner
      checkWinner(boardArray);

      setLoadingGame(false);
    } catch (err: any) {
      setError(err.message || "Failed to load game");
      setLoadingGame(false);
    }
  };

  const checkWinner = (board: BoardState) => {
    const winningLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const line of winningLines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinningCells(line);
        // Determine winner address
        if (board[a] === "X") {
          setWinner(player1);
        } else {
          setWinner(player2);
        }
        return;
      }
    }

    // Check for draw
    if (board.every((cell) => cell !== null)) {
      setWinner("draw");
    } else {
      setWinner(null);
      setWinningCells([]);
    }
  };

  const handleJoinGame = async () => {
    try {
      await joinGame(gameId);
      await loadGameData();
    } catch (err: any) {
      setError(err.message || "Failed to join game");
    }
  };

  const handleCellClick = async (index: number) => {
    if (!isPlayerTurn || board[index] !== null || gameStatus !== "active") {
      return;
    }

    try {
      await makeMove(gameId, index);
      await loadGameData();
    } catch (err: any) {
      setError(err.message || "Failed to make move");
    }
  };

  const getPlayerSymbol = (playerAddress: string | null): CellValue => {
    if (!playerAddress || !player1) return null;
    if (playerAddress.toLowerCase() === player1.toLowerCase()) return "X";
    if (player2 && playerAddress.toLowerCase() === player2.toLowerCase())
      return "O";
    return null;
  };

  const isPlayer1 = address?.toLowerCase() === player1?.toLowerCase();
  const isPlayer2 = address?.toLowerCase() === player2?.toLowerCase();
  const playerSymbol = isPlayer1 ? "X" : isPlayer2 ? "O" : null;

  if (loadingGame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Link>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 md:p-8 shadow-2xl">
          {/* Game Info */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Game #{gameId.toString()}
                </h1>
                <div className="flex items-center gap-2 text-gray-400">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>Bet: {formatEther(betAmount)} ETH</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">
                    Player 1: {player1?.slice(0, 6)}...{player1?.slice(-4)}
                  </span>
                </div>
                {player2 ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">
                      Player 2: {player2.slice(0, 6)}...{player2.slice(-4)}
                    </span>
                  </div>
                ) : (
                  <div className="text-yellow-400 text-sm">Waiting for Player 2...</div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {canJoin && (
              <button
                onClick={handleJoinGame}
                disabled={loading}
                className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-green-500/50 disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join Game"}
              </button>
            )}

            {gameStatus === "active" && (
              <div className="text-center">
                {isPlayerTurn ? (
                  <div className="text-green-400 font-semibold">
                    Your turn! You are playing as {playerSymbol}
                  </div>
                ) : (
                  <div className="text-gray-400">
                    Waiting for opponent's move...
                  </div>
                )}
              </div>
            )}

            {winner && (
              <div className="text-center p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg">
                {winner === "draw" ? (
                  <div className="text-yellow-400 font-semibold text-lg">It's a Draw!</div>
                ) : winner?.toLowerCase() === address?.toLowerCase() ? (
                  <div className="text-green-400 font-semibold text-lg">
                    🎉 You Won! 🎉
                  </div>
                ) : (
                  <div className="text-red-400 font-semibold text-lg">You Lost</div>
                )}
              </div>
            )}
          </div>

          {/* Game Board */}
          <div className="flex justify-center mb-8">
            <GameBoard
              board={board}
              onCellClick={handleCellClick}
              disabled={!isPlayerTurn || gameStatus !== "active"}
              winner={winner === "draw" ? "draw" : winner ? (getPlayerSymbol(winner) || null) : null}
              winningCells={winningCells}
            />
          </div>

          {/* Player Info */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
              <div className="text-gray-400 text-sm mb-2">Player 1 (X)</div>
              <div className="text-white font-mono text-xs break-all">
                {player1?.slice(0, 8)}...{player1?.slice(-6)}
              </div>
            </div>
            {player2 ? (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
                <div className="text-gray-400 text-sm mb-2">Player 2 (O)</div>
                <div className="text-white font-mono text-xs break-all">
                  {player2.slice(0, 8)}...{player2.slice(-6)}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-500/20">
                <div className="text-yellow-400 text-sm">Waiting for Player 2</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

