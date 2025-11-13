"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Play, Plus, TrendingUp, Zap } from "lucide-react";
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
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all border border-white/20"
              >
                <Play className="w-5 h-5" />
                View Games
              </button>
              <button
                onClick={() => onTabChange?.("create")}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all border border-white/20"
              >
                <Plus className="w-5 h-5" />
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

      {/* Carousel */}
      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-3 overflow-hidden border border-orange-500 max-w-2xl mx-auto">
        <div className="relative h-48">
          {slides.map((slide, index) => {
            const Icon = slide.icon;
            const isActive = index === currentSlide;
            
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <div className="flex items-center gap-3 justify-center">
                    <div className="w-10 h-10 bg-white/5 rounded-md flex items-center justify-center border-[0.5px] border-white/10">
                      <Icon className={`w-5 h-5 ${
                        index === 0 ? "text-orange-500" : 
                        index === 1 ? "text-white" : 
                        "text-blue-500"
                      }`} />
                    </div>
                    <h3 className="text-2xl font-semibold text-white">{slide.title}</h3>
                  </div>
                  <p className="text-gray-300 max-w-md">{slide.description}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}

