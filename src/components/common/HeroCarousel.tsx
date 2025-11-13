"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Play, Plus, TrendingUp, Zap, ChevronDown, ChevronUp, Wallet, Gamepad2, Coins, Trophy } from "lucide-react";
import { TabType } from "@/app/page";

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
    description: "Create or join games instantly. No waiting, no queues. Just pure gaming fun.",
    icon: Zap,
    content: "Instant Play"
  },
  {
    id: 2,
    title: "Crypto Rewards",
    description: "Win ETH by outsmarting your opponents. Fair play guaranteed by smart contracts.",
    icon: TrendingUp,
    content: "Crypto Rewards"
  },
  {
    id: 3,
    title: "Decentralized",
    description: "Powered by blockchain. Your moves are transparent and verifiable on-chain.",
    icon: Play,
    content: "Decentralized"
  },
];

interface HeroCarouselProps {
  onTabChange?: (tab: TabType) => void;
}

export function HeroCarousel({ onTabChange }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Auto-advance every 6 seconds

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Hero Title and Description */}
      <div className="text-center space-y-6 mb-8">
        <h1 className="text-5xl md:text-7xl font-bold text-white">
          BL<span className="text-orange-500">O</span>C<span className="text-blue-500">X</span>TacToe
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
          Play fair. Win crypto. 
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          {isConnected ? (
            <>
              <button
                onClick={() => onTabChange?.("games")}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold text-base transition-all border border-white/20"
              >
                <Play className="w-4 h-4" />
                View Games
              </button>
              <button
                onClick={() => onTabChange?.("create")}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold text-base transition-all border border-white/20"
              >
                <Plus className="w-4 h-4" />
                Create Game
              </button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-400">Connect your wallet to start playing</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Carousel */}
      <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl max-w-2xl mx-auto">
        {/* Header/Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            {slides[currentSlide] && (
              <>
                <div className={`w-8 h-8 bg-white/5 rounded-md flex items-center justify-center border-[0.5px] border-white/10`}>
                  {(() => {
                    const Icon = slides[currentSlide].icon;
                    return <Icon className={`w-4 h-4 ${
                      currentSlide === 0 ? "text-orange-500" : 
                      currentSlide === 1 ? "text-white" : 
                      "text-blue-500"
                    }`} />;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{slides[currentSlide].title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-1">{slides[currentSlide].description}</p>
                </div>
              </>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-white" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Collapsible Content - How It Works */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-orange-500 mb-4 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { step: 1, title: "Connect Wallet", desc: "Link your Web3 wallet", icon: Wallet },
                { step: 2, title: "Create or Join", desc: "Start a game or join existing one", icon: Gamepad2 },
                { step: 3, title: "Place Bet", desc: "Set your bet amount in ETH", icon: Coins },
                { step: 4, title: "Play & Win", desc: "Make moves and claim victory", icon: Trophy },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-4 hover:border-white/20 transition-all text-center"
                  >
                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-orange-400/50">
                      <Icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-300">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

