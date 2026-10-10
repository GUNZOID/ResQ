import React from 'react';
import { Home, Map, AlertOctagon, Users, Sparkles } from 'lucide-react';

export type SafeZTab = 'home' | 'map' | 'sos' | 'contacts' | 'ai';

interface SafeZBottomNavProps {
  activeTab: SafeZTab;
  onChangeTab: (tab: SafeZTab) => void;
  unreadCount?: number;
  isSosActive?: boolean;
}

export const SafeZBottomNav: React.FC<SafeZBottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadCount = 2,
  isSosActive = false,
}) => {
  const tabs = [
    {
      id: 'home' as SafeZTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'map' as SafeZTab,
      label: 'Map',
      icon: Map,
    },
    {
      id: 'sos' as SafeZTab,
      label: 'SOS',
      icon: AlertOctagon,
      activeColor: 'text-rose-500',
      badgeDot: isSosActive,
    },
    {
      id: 'contacts' as SafeZTab,
      label: 'Contacts',
      icon: Users,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'ai' as SafeZTab,
      label: 'AI Guide',
      icon: Sparkles,
      badgeDot: true,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-[440px] mx-auto pointer-events-auto bg-[#10121A]/95 backdrop-blur-xl border-t border-[#222534] shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-4 pt-2 pb-1.5 transition-all">
        {/* Navigation Tab Bar */}
        <div className="grid grid-cols-5 items-center h-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className="relative flex flex-col items-center justify-center h-full min-h-[44px] transition-all duration-200 active:scale-95 group"
                aria-label={tab.label}
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-all duration-200 ${
                      isActive
                        ? tab.id === 'sos'
                          ? 'text-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(255,71,87,0.5)]'
                          : 'text-white scale-110'
                        : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                    strokeWidth={isActive ? 2.3 : 1.8}
                  />

                  {/* Unread badge count */}
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#10121A]">
                      {tab.badge}
                    </span>
                  )}

                  {/* SOS active pulse dot or AI glowing dot */}
                  {tab.badgeDot && (
                    <span
                      className={`absolute -top-0.5 -right-1 w-2 h-2 rounded-full ${
                        tab.id === 'sos' ? 'bg-rose-500 animate-ping' : 'bg-purple-500 animate-pulse'
                      }`}
                    />
                  )}
                </div>

                {/* Subtle active dot underneath */}
                <span
                  className={`w-1 h-1 rounded-full mt-1 transition-all duration-200 ${
                    isActive
                      ? tab.id === 'sos'
                        ? 'bg-rose-500 scale-100 opacity-100'
                        : 'bg-white scale-100 opacity-100'
                      : 'bg-transparent scale-0 opacity-0'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Native iOS Home Indicator Bar */}
        <div className="w-32 h-1 bg-gray-600/70 rounded-full mx-auto mt-1 mb-0.5" />
      </div>
    </div>
  );
};
