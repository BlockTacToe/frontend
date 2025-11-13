"use client";

import { Gamepad2, Plus, Trophy } from "lucide-react";
import { TabType } from "@/app/page";

interface Tab {
  name: string;
  id: TabType;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { name: "Games", id: "games", icon: Gamepad2 },
  { name: "Create Game", id: "create", icon: Plus },
  { name: "Leaderboard", id: "leaderboard", icon: Trophy },
];

interface TabNavigationProps {
  activeTab: TabType | null;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-white/10">
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
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-400 hover:text-orange-500 border-b-2 border-transparent hover:border-orange-500"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

