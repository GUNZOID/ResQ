import React from 'react';
import { Map, AlertOctagon, MessageSquare, Sparkles } from 'lucide-react';

export type SectionId = 'map-section' | 'sos-section' | 'messaging-section' | 'ai-chatbot-section';

interface SectionNavigationBarProps {
  activeSection: SectionId;
  onSelectSection: (sectionId: SectionId) => void;
  unreadCount?: number;
}

export const SectionNavigationBar: React.FC<SectionNavigationBarProps> = ({
  activeSection,
  onSelectSection,
  unreadCount = 2,
}) => {
  const sections = [
    {
      id: 'map-section' as SectionId,
      label: 'Map',
      sub: 'Radar',
      icon: Map,
      accentColor: 'text-emerald-600',
      activeBg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      barColor: 'bg-emerald-500',
      badge: 'Live',
    },
    {
      id: 'sos-section' as SectionId,
      label: 'SOS',
      sub: 'Beacon',
      icon: AlertOctagon,
      accentColor: 'text-rose-600',
      activeBg: 'bg-rose-50 text-rose-700 border-rose-300',
      barColor: 'bg-rose-500',
      badge: 'Alert',
    },
    {
      id: 'messaging-section' as SectionId,
      label: 'Chat',
      sub: 'P2P',
      icon: MessageSquare,
      accentColor: 'text-blue-600',
      activeBg: 'bg-blue-50 text-blue-700 border-blue-300',
      barColor: 'bg-blue-600',
      badge: `${unreadCount}`,
    },
    {
      id: 'ai-chatbot-section' as SectionId,
      label: 'AI Guide',
      sub: 'LLM',
      icon: Sparkles,
      accentColor: 'text-purple-600',
      activeBg: 'bg-purple-50 text-purple-700 border-purple-300',
      barColor: 'bg-purple-600',
      badge: '24/7',
    },
  ];

  return (
    <div className="sticky top-[73px] z-[450] bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-xs py-2 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* The 4-segment Navigation Bar */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-gray-100/90 rounded-2xl border border-gray-200/70">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-2.5 rounded-xl transition-all duration-200 text-center select-none ${
                  isActive
                    ? 'bg-white shadow-xs text-gray-900 font-semibold'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/50 font-medium'
                }`}
              >
                {/* Active Indicator Bar at top of segment */}
                {isActive && (
                  <span
                    className={`absolute -top-1 left-3 right-3 h-[3px] rounded-full ${section.barColor} transition-all duration-300`}
                  />
                )}

                <div className="flex items-center gap-1.5">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? section.accentColor : 'text-gray-400'
                    }`}
                  />
                  <span className="text-xs tracking-tight">{section.label}</span>
                </div>

                {/* Subtle Mini Badge */}
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase transition-colors hidden sm:inline-block ${
                    isActive
                      ? `${section.activeBg} border`
                      : 'bg-gray-200/70 text-gray-500'
                  }`}
                >
                  {section.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
