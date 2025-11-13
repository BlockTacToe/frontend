"use client";

import { useAccount } from "wagmi";
import { useBlOcXTacToe } from "@/hooks/useBlOcXTacToe";
import ConnectButton from "./ConnectButton";
import Link from "next/link";

export default function Header() {
  const { address, isConnected } = useAccount();
  const { isAdmin } = useBlOcXTacToe();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  <span className="text-orange-500">BLOC</span>
                  <span className="text-blue-500">X</span>
                  <span className="text-white">TacToe</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/games" className="text-gray-300 hover:text-white transition-colors">
              Games
            </Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">
              Leaderboard
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-orange-500 hover:text-orange-400 transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
