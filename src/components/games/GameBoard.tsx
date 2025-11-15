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
  boardSize?: number;
}

export function GameBoard({
  board,
  onCellClick,
  disabled = false,
  winner = null,
  winningCells = [],
  boardSize = 3,
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
          bg-white
          border-2 border-gray-300
          rounded-xl
          flex items-center justify-center
          transition-all duration-200
          ${isWinning ? "bg-gray-200 border-gray-500 shadow-lg" : ""}
          ${isHovered ? "border-gray-500 bg-gray-50 scale-105 shadow-md" : ""}
          ${isDisabled && !isWinning ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"}
          ${!value && !isDisabled ? "hover:bg-gray-50" : ""}
        `}
      >
        {value === "X" && (
          <X
            className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-500 ${
              isWinning ? "text-blue-600 drop-shadow-lg" : ""
            }`}
            strokeWidth={3}
          />
        )}
        {value === "O" && (
          <Circle
            className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-orange-500 ${
              isWinning ? "text-orange-600 drop-shadow-lg" : ""
            }`}
            strokeWidth={3}
            fill="none"
          />
        )}
        {isHovered && !value && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 border-2 border-gray-400 rounded-full" />
          </div>
        )}
      </button>
    );
  };

  const gridColsClass = boardSize === 3 ? "grid-cols-3" : boardSize === 5 ? "grid-cols-5" : "grid-cols-7";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className={`grid ${gridColsClass} gap-2 sm:gap-3 md:gap-4 bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-gray-300 shadow-sm`}>
        {board.map((cell, index) => (
          <div key={index} className="aspect-square">
            {renderCell(index, cell)}
          </div>
        ))}
      </div>
    </div>
  );
}

