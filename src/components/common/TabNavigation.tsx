"use client";

import { Gamepad2, Plus, Trophy, Sword } from "lucide-react";
import { TabType } from "@/app/page";

interface Tab {
  name: string;
  id: TabType;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { name: "Games", id: "games", icon: Gamepad2 },
  { name: "Create Game", id: "create", icon: Plus },
  { name: "Challenges", id: "challenges", icon: Sword },
  { name: "Leaderboard", id: "leaderboard", icon: Trophy },
];

interface TabNavigationProps {
  activeTab: TabType | null;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="relative">
      <nav className="flex justify-center space-x-1 px-4 md:px-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all
                ${
                  isActive
                    ? "text-orange-500"
                    : "text-gray-400 hover:text-orange-500"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-orange-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

