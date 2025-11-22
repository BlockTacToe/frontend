"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black/40 border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-row items-center justify-between">
          {/* BlOcXTacToe Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">
                  <span className="text-orange-500">BLOC</span>
                  <span className="text-blue-500">X</span>
                  <span className="text-white">TacToe</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <Link href="/games" className="text-gray-400 hover:text-white transition-colors text-sm">
              Games
            </Link>
            <Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors text-sm">
              Leaderboard
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400">
            © 2025 <span className="text-white">BlOcXTacToe</span>. Built on <span className="text-blue-500">Base</span>. Powered by Farcaster.
          </p>
        </div>
      </div>
    </footer>
  );
}
