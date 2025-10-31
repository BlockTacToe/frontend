"use client";

import { useState } from "react";
import { X, Circle } from "lucide-react";

export type CellValue = "X" | "O" | null;
export type BoardState = CellValue[];

interface GameBoardProps {
  board: BoardState;
  onCellClick: (index: number) => void;
  disabled?: boolean;
  winner?: "X" | "O" | "draw" | null;
  winningCells?: number[];
}

export function GameBoard({
  board,
  onCellClick,
  disabled = false,
  winner = null,
  winningCells = [],
}: GameBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const isWinningCell = (index: number) => winningCells.includes(index);

  const renderCell = (index: number, value: CellValue) => {
    const isDisabled = disabled || value !== null || winner !== null;
    const isWinning = isWinningCell(index);
    const isHovered = hoveredCell === index && !value && !isDisabled;

    return (
      <button
        key={index}
        onClick={() => !isDisabled && onCellClick(index)}
        onMouseEnter={() => !isDisabled && setHoveredCell(index)}
        onMouseLeave={() => setHoveredCell(null)}
        disabled={isDisabled}
        className={`
          relative aspect-square w-full h-full
          bg-gradient-to-br from-slate-800/50 to-slate-900/50
          border-2 border-purple-500/30
          rounded-xl
          flex items-center justify-center
          transition-all duration-200
          ${isWinning ? "bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-400/50 shadow-lg shadow-yellow-500/50" : ""}
          ${isHovered ? "border-purple-400/60 bg-purple-500/20 scale-105 shadow-lg shadow-purple-500/30" : ""}
          ${isDisabled && !isWinning ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-purple-400/60"}
          ${!value && !isDisabled ? "hover:bg-purple-500/10" : ""}
        `}
      >
        {value === "X" && (
          <X
            className={`w-12 h-12 md:w-16 md:h-16 text-blue-400 ${
              isWinning ? "text-yellow-400 drop-shadow-lg" : ""
            }`}
            strokeWidth={3}
          />
        )}
        {value === "O" && (
          <Circle
            className={`w-12 h-12 md:w-16 md:h-16 text-purple-400 ${
              isWinning ? "text-yellow-400 drop-shadow-lg" : ""
            }`}
            strokeWidth={3}
            fill="none"
          />
        )}
        {isHovered && !value && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-purple-400/40 rounded-full" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-3 md:gap-4 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-4 md:p-6 rounded-2xl border border-purple-500/20 shadow-2xl backdrop-blur-sm">
        {board.map((cell, index) => (
          <div key={index} className="aspect-square">
            {renderCell(index, cell)}
          </div>
        ))}
      </div>
    </div>
  );
}

