import React from 'react';
import { X, ShieldAlert, Radio, Battery, Volume2, Compass, Check } from 'lucide-react';

interface SafeZQuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafeZQuickHelpModal: React.FC<SafeZQuickHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#141620] w-full max-w-[400px] rounded-3xl border border-[#272B3C] shadow-2xl p-5 text-white select-none">
        <div className="flex items-center justify-between pb-3 border-b border-[#222534]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold">ResQ Field Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-xs text-gray-300">
          <div className="flex items-start gap-3">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Zero-Cellular P2P Mesh</p>
              <p className="text-gray-400 mt-0.5 leading-relaxed">
                ResQ connects directly between nearby devices using device radio transmitters. Packets relay across up to 3 hops without internet.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Volume2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Concentric Glowing SOS</p>
              <p className="text-gray-400 mt-0.5 leading-relaxed">
                Tapping the central SOS button or dragging the slider broadcasts an instant emergency packet and triggers high-frequency audio pings.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Compass className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Radar & Route Distance</p>
              <p className="text-gray-400 mt-0.5 leading-relaxed">
                The Location tab displays live bearing vectors and real-time routing paths to trusted family & community shelters.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-white text-gray-950 hover:bg-gray-200 font-bold text-xs transition-colors mt-2"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
