"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";

// Mock game storage (simulating blockchain) - using localStorage for persistence
const STORAGE_KEY = "blocktactoe_simulation_games";
const GAME_ID_KEY = "blocktactoe_next_game_id";

// Helper functions for localStorage with BigInt serialization
const getGamesStorage = (): Map<string, any> => {
  if (typeof window === "undefined") return new Map();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const games = new Map();
      
      // Convert string BigInt values back to BigInt
      for (const [key, value] of Object.entries(data)) {
        const game = value as any;
        if (game) {
          games.set(key, {
            ...game,
            gameId: BigInt(game.gameId || "0"),
            betAmount: BigInt(game.betAmount || "0"),
          });
        }
      }
      
      return games;
    }
  } catch (e) {
    console.error("Failed to load games from storage:", e);
  }
  return new Map();
};

const saveGamesStorage = (games: Map<string, any>) => {
  if (typeof window === "undefined") return;
  try {
    const data: Record<string, any> = {};
    
    // Convert BigInt values to strings for JSON serialization
    for (const [key, game] of games.entries()) {
      data[key] = {
        ...game,
        gameId: game.gameId?.toString() || "0",
        betAmount: game.betAmount?.toString() || "0",
      };
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save games to storage:", e);
  }
};

const getNextGameId = (): bigint => {
  if (typeof window === "undefined") return 1n;
  try {
    const stored = localStorage.getItem(GAME_ID_KEY);
    if (stored) {
      return BigInt(stored);
    }
  } catch (e) {
    console.error("Failed to load next game ID:", e);
  }
  return 1n;
};

const setNextGameId = (id: bigint) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GAME_ID_KEY, id.toString());
  } catch (e) {
    console.error("Failed to save next game ID:", e);
  }
};

interface MockGame {
  gameId: bigint;
  player1: string;
  player2: string | null;
  betAmount: bigint;
  status: number; // 0: waiting, 1: active, 2: finished
  currentPlayer: string | null;
  isFinished: boolean;
  board: number[]; // 0: empty, 1: X, 2: O
  winner: string | null;
}

export function useGameSimulation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();

  const getContract = useCallback(() => {
    return {
      createGame: async (betAmountWei: bigint) => {
        if (!address) throw new Error("Wallet not connected");
        
        const mockGamesStorage = getGamesStorage();
        const nextGameId = getNextGameId();
        const gameId = nextGameId;
        setNextGameId(nextGameId + 1n);
        
        const game: MockGame = {
          gameId,
          player1: address,
          player2: null,
          betAmount: betAmountWei,
          status: 0, // waiting
          currentPlayer: address,
          isFinished: false,
          board: Array(9).fill(0),
          winner: null,
        };
        
        mockGamesStorage.set(gameId.toString(), game);
        saveGamesStorage(mockGamesStorage);
        
        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          wait: async () => ({
            logs: [],
          }),
        };
      },
      
      joinGame: async (gameId: bigint) => {
        if (!address) throw new Error("Wallet not connected");
        
        const mockGamesStorage = getGamesStorage();
        const game = mockGamesStorage.get(gameId.toString());
        if (!game) throw new Error("Game not found");
        if (game.player2) throw new Error("Game already has a player");
        if (game.player1 === address) throw new Error("Cannot join your own game");
        
        game.player2 = address;
        game.status = 1; // active
        game.currentPlayer = game.player1; // Player 1 starts
        
        mockGamesStorage.set(gameId.toString(), game);
        saveGamesStorage(mockGamesStorage);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          wait: async () => ({}),
        };
      },
      
      makeMove: async (gameId: bigint, position: number) => {
        if (!address) throw new Error("Wallet not connected");
        
        const mockGamesStorage = getGamesStorage();
        const game = mockGamesStorage.get(gameId.toString());
        if (!game) throw new Error("Game not found");
        if (!game.player2) throw new Error("Game not started");
        if (game.isFinished) throw new Error("Game is finished");
        if (game.currentPlayer?.toLowerCase() !== address.toLowerCase()) {
          throw new Error("Not your turn");
        }
        if (game.board[position] !== 0) throw new Error("Position already taken");
        
        // Determine symbol: Player 1 = X (1), Player 2 = O (2)
        const symbol = game.player1.toLowerCase() === address.toLowerCase() ? 1 : 2;
        game.board[position] = symbol;
        
        // Switch turns
        game.currentPlayer = game.currentPlayer === game.player1 ? game.player2 : game.player1;
        
        // Check for winner
        const winner = checkWinner(game.board);
        if (winner) {
          game.isFinished = true;
          game.status = 2; // finished
          game.winner = winner === 1 ? game.player1 : game.player2;
        } else if (game.board.every(cell => cell !== 0)) {
          // Draw
          game.isFinished = true;
          game.status = 2;
          game.winner = "0x0000000000000000000000000000000000000000"; // Draw indicator
        }
        
        mockGamesStorage.set(gameId.toString(), game);
        saveGamesStorage(mockGamesStorage);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          wait: async () => ({}),
        };
      },
      
      getGame: async (gameId: bigint) => {
        const mockGamesStorage = getGamesStorage();
        const game = mockGamesStorage.get(gameId.toString());
        if (!game) throw new Error("Game not found");
        
        return [
          game.player1,
          game.player2 || "0x0000000000000000000000000000000000000000",
          game.betAmount,
          game.status,
          game.currentPlayer || "0x0000000000000000000000000000000000000000",
          game.isFinished,
        ];
      },
      
      getGameBoard: async (gameId: bigint) => {
        const mockGamesStorage = getGamesStorage();
        const game = mockGamesStorage.get(gameId.toString());
        if (!game) throw new Error("Game not found");
        
        return game.board;
      },
      
      getAllGames: async () => {
        const mockGamesStorage = getGamesStorage();
        return Array.from(mockGamesStorage.keys()).map(id => BigInt(id));
      },
    };
  }, [address]);

  const checkWinner = (board: number[]): number | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6], // diagonals
    ];
    
    for (const [a, b, c] of lines) {
      if (board[a] !== 0 && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    
    return null;
  };

  const createGame = useCallback(async (betAmount: string) => {
    if (!isConnected || !address) {
      throw new Error("Please connect your wallet");
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getContract();
      const { ethers } = await import("ethers");
      const betAmountWei = ethers.parseEther(betAmount);
      const tx = await contract.createGame(betAmountWei);
      
      toast.info("Creating game...", {
        position: "bottom-right",
      });
      
      await tx.wait();
      
      const gameId = getNextGameId() - 1n;
      toast.success(`Game created successfully! Game ID: ${gameId.toString()}`, {
        position: "bottom-right",
      });
      
      return gameId;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create game";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, getContract]);

  const joinGame = useCallback(async (gameId: bigint) => {
    if (!isConnected || !address) {
      throw new Error("Please connect your wallet");
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getContract();
      const tx = await contract.joinGame(gameId);
      toast.info("Joining game...", {
        position: "bottom-right",
      });
      
      await tx.wait();
      toast.success("Successfully joined the game!", {
        position: "bottom-right",
      });
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to join game";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, getContract]);

  const makeMove = useCallback(async (gameId: bigint, position: number) => {
    if (!isConnected || !address) {
      throw new Error("Please connect your wallet");
    }

    if (position < 0 || position > 8) {
      throw new Error("Invalid position");
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getContract();
      const tx = await contract.makeMove(gameId, position);
      toast.info("Making move...", {
        position: "bottom-right",
      });
      
      await tx.wait();
      toast.success("Move made successfully!", {
        position: "bottom-right",
      });
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to make move";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, getContract]);

  const getGame = useCallback(async (gameId: bigint) => {
    try {
      const contract = getContract();
      const gameData = await contract.getGame(gameId);
      return gameData;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to get game";
      setError(errorMessage);
      throw err;
    }
  }, [getContract]);

  const getGameBoard = useCallback(async (gameId: bigint) => {
    try {
      const contract = getContract();
      const board = await contract.getGameBoard(gameId);
      return board;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to get game board";
      setError(errorMessage);
      throw err;
    }
  }, [getContract]);

  const getAllGames = useCallback(async () => {
    try {
      const contract = getContract();
      const gameIds = await contract.getAllGames();
      return gameIds;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to get games";
      setError(errorMessage);
      throw err;
    }
  }, [getContract]);

  return {
    loading,
    error,
    createGame,
    joinGame,
    makeMove,
    getGame,
    getGameBoard,
    getAllGames,
  };
}

