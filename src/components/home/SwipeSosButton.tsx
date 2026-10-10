import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Check, AlertOctagon } from 'lucide-react';

interface SwipeSosButtonProps {
  onTrigger: () => void;
  isTriggered: boolean;
  onReset?: () => void;
}

export const SwipeSosButton: React.FC<SwipeSosButtonProps> = ({
  onTrigger,
  isTriggered,
  onReset,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);

  const maxDrag = 220; // approximate draggable width

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isTriggered) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX - sliderPos;
  };

  useEffect(() => {
    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging || isTriggered) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const currentTrackWidth = trackRef.current ? trackRef.current.offsetWidth - 56 : maxDrag;
      const newPos = Math.max(0, Math.min(clientX - startXRef.current, currentTrackWidth));
      setSliderPos(newPos);

      // Trigger threshold (85% of track)
      if (newPos >= currentTrackWidth * 0.85) {
        setIsDragging(false);
        setSliderPos(currentTrackWidth);
        onTrigger();
      }
    };

    const handleEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      const currentTrackWidth = trackRef.current ? trackRef.current.offsetWidth - 56 : maxDrag;
      if (sliderPos < currentTrackWidth * 0.85) {
        setSliderPos(0); // Snap back if not completed
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, sliderPos, isTriggered, onTrigger]);

  return (
    <div
      ref={trackRef}
      className={`relative w-full max-w-sm mx-auto h-14 rounded-full p-1.5 flex items-center select-none overflow-hidden transition-colors ${
        isTriggered
          ? 'bg-red-600 shadow-md'
          : 'bg-[#121212] shadow-sm'
      }`}
    >
      {/* Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`text-xs sm:text-sm font-semibold tracking-wide transition-opacity ${
            isTriggered ? 'text-white' : 'text-gray-300'
          } ${sliderPos > 40 && !isTriggered ? 'opacity-30' : 'opacity-100'}`}
        >
          {isTriggered ? 'SOS BROADCAST ACTIVE' : 'Swipe to launch SOS'}
        </span>
      </div>

      {/* Draggable Knob */}
      <div
        onMouseDown={handleTouchStart}
        onTouchStart={handleTouchStart}
        style={{
          transform: `translateX(${sliderPos}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className={`w-11 h-11 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md z-10 transition-colors ${
          isTriggered
            ? 'bg-white text-red-600'
            : 'bg-white text-gray-900 hover:bg-gray-100'
        }`}
      >
        {isTriggered ? (
          <Check className="w-5 h-5 stroke-[2.5]" />
        ) : (
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        )}
      </div>

      {/* Quick Tap button for convenience */}
      {!isTriggered ? (
        <button
          onClick={() => {
            const currentTrackWidth = trackRef.current ? trackRef.current.offsetWidth - 56 : maxDrag;
            setSliderPos(currentTrackWidth);
            onTrigger();
          }}
          className="absolute right-3 text-[10px] text-gray-400 font-medium hover:text-white uppercase tracking-wider py-1 px-2 rounded-full hover:bg-white/10 transition-colors"
          title="Or tap to trigger immediately"
        >
          Tap
        </button>
      ) : (
        onReset && (
          <button
            onClick={() => {
              setSliderPos(0);
              onReset();
            }}
            className="absolute right-3 text-[11px] text-white/90 font-medium hover:text-white underline py-1 px-2 transition-colors z-20"
          >
            Cancel
          </button>
        )
      )}
    </div>
  );
};
