"use client";

import { useState, useCallback } from "react";
import { useAccount, useConfig } from "wagmi";
import { Contract, ethers } from "ethers";
import { getEthersSigner } from "@/config/adapter";
import { toast } from "react-toastify";
import { useGameSimulation } from "./useGameSimulation";

// This would be your contract ABI - placeholder for now
const GAME_CONTRACT_ABI = [
  "function createGame(uint256 betAmount) public returns (uint256)",
  "function joinGame(uint256 gameId) public",
  "function makeMove(uint256 gameId, uint256 position) public",
  "function getGame(uint256 gameId) public view returns (address, address, uint256, uint8, address, bool)",
  "function getGameBoard(uint256 gameId) public view returns (uint8[9])",
  "function getAllGames() public view returns (uint256[])",
  "event GameCreated(uint256 indexed gameId, address indexed player1, uint256 betAmount)",
  "event GameJoined(uint256 indexed gameId, address indexed player2)",
  "event MoveMade(uint256 indexed gameId, address indexed player, uint256 position)",
  "event GameFinished(uint256 indexed gameId, address indexed winner)",
];

export function useGame() {
  // Check if we're in simulation mode (no contract address configured)
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  const isSimulationMode = contractAddress === "0x0000000000000000000000000000000000000000";
  
  // Always call hooks (React rules)
  const simulationHook = useGameSimulation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const config = useConfig();
  
  // If simulation mode, return simulation functions
  if (isSimulationMode) {
    return simulationHook;
  }

  const getContract = useCallback(async () => {
    if (!isConnected || !address || !config) {
      throw new Error("Wallet not connected");
    }

    const signer = await getEthersSigner(config);
    if (!signer) {
      throw new Error("Failed to get signer");
    }

    return new Contract(contractAddress, GAME_CONTRACT_ABI, signer);
  }, [isConnected, address, config, contractAddress]);

  const createGame = useCallback(async (betAmount: string) => {
    if (!isConnected || !address) {
      throw new Error("Please connect your wallet");
    }

    setLoading(true);
    setError(null);

    try {
      const contract = await getContract();
      const betAmountWei = ethers.parseEther(betAmount);
      const tx = await contract.createGame(betAmountWei);
      toast.info("Transaction submitted. Waiting for confirmation...", {
        position: "bottom-right",
      });
      
      const receipt = await tx.wait();
      
      // Find GameCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === "GameCreated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        const gameId = parsed?.args[0];
        toast.success(`Game created successfully! Game ID: ${gameId.toString()}`, {
          position: "bottom-right",
        });
        return gameId;
      }

      throw new Error("Game creation event not found");
    } catch (err: any) {
      const errorMessage = err?.reason || err?.message || "Failed to create game";
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
      const contract = await getContract();
      const tx = await contract.joinGame(gameId);
      toast.info("Transaction submitted. Waiting for confirmation...", {
        position: "bottom-right",
      });
      
      await tx.wait();
      toast.success("Successfully joined the game!", {
        position: "bottom-right",
      });
    } catch (err: any) {
      const errorMessage = err?.reason || err?.message || "Failed to join game";
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
      const contract = await getContract();
      const tx = await contract.makeMove(gameId, position);
      toast.info("Move submitted. Waiting for confirmation...", {
        position: "bottom-right",
      });
      
      await tx.wait();
      toast.success("Move made successfully!", {
        position: "bottom-right",
      });
    } catch (err: any) {
      const errorMessage = err?.reason || err?.message || "Failed to make move";
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
      const contract = await getContract();
      const gameData = await contract.getGame(gameId);
      return gameData;
    } catch (err: any) {
      const errorMessage = err?.reason || err?.message || "Failed to get game";
      setError(errorMessage);
      throw err;
    }
  }, [getContract]);

  const getGameBoard = useCallback(async (gameId: bigint) => {
    try {
      const contract = await getContract();
      const board = await contract.getGameBoard(gameId);
      return board;
    } catch (err: any) {
      const errorMessage = err?.reason || err?.message || "Failed to get game board";
      setError(errorMessage);
      throw err;
    }
  }, [getContract]);

  const getAllGames = useCallback(async () => {
    try {
      const contract = await getContract();
      const gameIds = await contract.getAllGames();
      return gameIds;
    } catch (err: any) {
      const errorMessage = err?.reason || err?.message || "Failed to get games";
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
