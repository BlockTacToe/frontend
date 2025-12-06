"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  Play,
  Plus,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronUp,
  Wallet,
  Gamepad2,
  Coins,
  Trophy,
} from "lucide-react";
import { TabType } from "@/app/page";
import { CounterModal } from "./CounterModal";

interface Slide {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Instant Play",
    description:
      "Create or join games instantly. No waiting, no queues. Just pure gaming fun.",
    icon: Zap,
    content: "Instant Play",
  },
  {
    id: 2,
    title: "Crypto Rewards",
    description:
      "Win ETH by outsmarting your opponents. Fair play guaranteed by smart contracts.",
    icon: TrendingUp,
    content: "Crypto Rewards",
  },
  {
    id: 3,
    title: "Decentralized",
    description:
      "Powered by blockchain. Your moves are transparent and verifiable on-chain.",
    icon: Play,
    content: "Decentralized",
  },
];

interface HeroCarouselProps {
  onTabChange?: (tab: TabType) => void;
}

export function HeroCarousel({ onTabChange }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const { isConnected } = useAccount();

  // Prevent hydration mismatch by only showing wallet-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Auto-advance every 6 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto px-2 sm:px-4">
      {/* Hero Title and Description */}
      <div className="text-center space-y-3 sm:space-y-4 md:space-y-6 mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
          BL<span className="text-orange-500">O</span>C
          <span className="text-blue-500">X</span>TacToe
        </h1>
        <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto px-2">
          <Link
            href="/admin"
            className="no-underline focus:outline-none focus:ring-0 hover:opacity-90 transition-opacity"
          >
            Play fair
          </Link>
          .{" "}
          <button
            onClick={() => setIsCounterModalOpen(true)}
            className="no-underline focus:outline-none focus:ring-0 hover:opacity-90 transition-opacity bg-transparent border-none p-0 text-gray-300 text-sm sm:text-base md:text-xl lg:text-2xl cursor-pointer"
          >
            Win crypto
          </button>
          .
        </p>
        <div className="flex flex-row gap-2 sm:gap-3 justify-center items-center pt-4 sm:pt-6">
          {!mounted ? (
            // Show loading placeholder during SSR/hydration to prevent mismatch
            <div className="text-center space-y-2 sm:space-y-4">
              <p className="text-xs sm:text-sm md:text-base text-gray-400 px-2">
                Loading...
              </p>
            </div>
          ) : isConnected ? (
            <>
              <button
                onClick={() => onTabChange?.("games")}
                className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all border border-white/20"
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="sm:hidden">Games</span>
                <span className="hidden sm:inline">View Games</span>
              </button>
              <button
                onClick={() => onTabChange?.("create")}
                className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all border border-white/20"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="sm:hidden">Create</span>
                <span className="hidden sm:inline">Create Game</span>
              </button>
            </>
          ) : (
            <div className="text-center space-y-2 sm:space-y-4">
              <p className="text-xs sm:text-sm md:text-base text-gray-400 px-2">
                Connect your wallet to start playing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Carousel */}
      <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl max-w-2xl mx-auto">
        {/* Header/Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {slides[currentSlide] && (
              <>
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 bg-white/5 rounded-md flex items-center justify-center border-[0.5px] border-white/10 flex-shrink-0`}
                >
                  {(() => {
                    const Icon = slides[currentSlide].icon;
                    return (
                      <Icon
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          currentSlide === 0
                            ? "text-orange-500"
                            : currentSlide === 1
                            ? "text-white"
                            : "text-blue-500"
                        }`}
                      />
                    );
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                    {slides[currentSlide].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 line-clamp-1 hidden sm:block">
                    {slides[currentSlide].description}
                  </p>
                </div>
              </>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0 ml-2" />
          )}
        </button>

        {/* Collapsible Content - How It Works */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded
              ? "max-h-[500px] sm:max-h-96 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-orange-500 mb-3 sm:mb-4 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {[
                {
                  step: 1,
                  title: "Connect Wallet",
                  desc: "Link your Web3 wallet",
                  icon: Wallet,
                },
                {
                  step: 2,
                  title: "Create or Join",
                  desc: "Start a game or join existing one",
                  icon: Gamepad2,
                },
                {
                  step: 3,
                  title: "Place Bet",
                  desc: "Set your bet amount in ETH",
                  icon: Coins,
                },
                {
                  step: 4,
                  title: "Play & Win",
                  desc: "Make moves and claim victory",
                  icon: Trophy,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 p-2 sm:p-4 hover:border-white/20 transition-all text-center"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1 sm:mb-2 border border-orange-400/50">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-0.5 sm:mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-300 hidden sm:block">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Counter Modal */}
      <CounterModal
        isOpen={isCounterModalOpen}
        onClose={() => setIsCounterModalOpen(false)}
      />
    </div>
  );
}
