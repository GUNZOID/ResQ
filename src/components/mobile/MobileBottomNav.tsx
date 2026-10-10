import React from 'react';
import { AlertCircle, Compass, MapPin, Wrench } from 'lucide-react';

export type MobileTab = 'SOS' | 'RADAR' | 'MAP' | 'TOOLS';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  hasEmergencyAlerts?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  hasEmergencyAlerts = false,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#161412]/95 backdrop-blur-md border-t border-[#2C2722] px-3 py-1.5 select-none">
      <div className="max-w-[430px] mx-auto grid grid-cols-4 items-center h-14">
        {/* [SOS] Tab */}
        <button
          onClick={() => onChangeTab('SOS')}
          className={`relative flex flex-col items-center justify-center h-full min-h-[44px] rounded-xl transition-all active:scale-95 ${
            activeTab === 'SOS'
              ? 'text-[#E07A5F]'
              : 'text-[#968F83] hover:text-[#D6D0C4]'
          }`}
        >
          <div className="relative">
            <AlertCircle
              className={`w-5 h-5 transition-transform duration-200 ${
                activeTab === 'SOS' ? 'scale-110' : ''
              }`}
            />
            {hasEmergencyAlerts && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E07A5F] animate-ping" />
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-1">SOS</span>
          {activeTab === 'SOS' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] mt-0.5" />
          )}
        </button>

        {/* [Radar] Tab */}
        <button
          onClick={() => onChangeTab('RADAR')}
          className={`relative flex flex-col items-center justify-center h-full min-h-[44px] rounded-xl transition-all active:scale-95 ${
            activeTab === 'RADAR'
              ? 'text-[#81B29A]'
              : 'text-[#968F83] hover:text-[#D6D0C4]'
          }`}
        >
          <Compass
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'RADAR' ? 'scale-110 text-[#81B29A]' : ''
            }`}
          />
          <span className="text-[11px] font-medium tracking-tight mt-1">Circle</span>
          {activeTab === 'RADAR' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#81B29A] mt-0.5" />
          )}
        </button>

        {/* [Map] Tab */}
        <button
          onClick={() => onChangeTab('MAP')}
          className={`relative flex flex-col items-center justify-center h-full min-h-[44px] rounded-xl transition-all active:scale-95 ${
            activeTab === 'MAP'
              ? 'text-[#6495ED]'
              : 'text-[#968F83] hover:text-[#D6D0C4]'
          }`}
        >
          <MapPin
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'MAP' ? 'scale-110 text-[#6495ED]' : ''
            }`}
          />
          <span className="text-[11px] font-medium tracking-tight mt-1">Map</span>
          {activeTab === 'MAP' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#6495ED] mt-0.5" />
          )}
        </button>

        {/* [Tools] Tab */}
        <button
          onClick={() => onChangeTab('TOOLS')}
          className={`relative flex flex-col items-center justify-center h-full min-h-[44px] rounded-xl transition-all active:scale-95 ${
            activeTab === 'TOOLS'
              ? 'text-[#E9B44C]'
              : 'text-[#968F83] hover:text-[#D6D0C4]'
          }`}
        >
          <Wrench
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'TOOLS' ? 'scale-110 text-[#E9B44C]' : ''
            }`}
          />
          <span className="text-[11px] font-medium tracking-tight mt-1">Care & Kit</span>
          {activeTab === 'TOOLS' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#E9B44C] mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
