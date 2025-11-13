"use client";

import { useState } from "react";
import { HeroCarousel } from "@/components/common/HeroCarousel";
import { TabNavigation } from "@/components/common/TabNavigation";
import { GamesContent } from "@/components/common/GamesContent";
import { CreateGameContent } from "@/components/common/CreateGameContent";
import { LeaderboardContent } from "@/components/common/LeaderboardContent";

export type TabType = "games" | "create" | "leaderboard";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-20">
      <div className="max-w-6xl w-full space-y-12">
        {/* Hero Carousel */}
        <HeroCarousel onTabChange={setActiveTab} />

        {/* Navigation Tabs */}
        <div className="mt-8">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        {activeTab && (
          <div className="mt-8">
            {activeTab === "games" && <GamesContent onTabChange={setActiveTab} />}
            {activeTab === "create" && <CreateGameContent />}
            {activeTab === "leaderboard" && <LeaderboardContent />}
          </div>
        )}
      </div>
    </div>
  );
}
