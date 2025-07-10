import React, { useRef } from 'react';
import { Direction } from '../types';
import { GAME_TICK_MS } from '../constants';

const DPadButton: React.FC<{
  onPress: (direction: Direction) => void;
  direction: Direction;
  gridPlacement: string;
  children: React.ReactNode;
}> = ({ onPress, direction, gridPlacement, children }) => {
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handlePressStart = () => {
    // Clear any existing timers to prevent conflicts
    handlePressEnd();
    // Move once immediately
    onPress(direction);
    // After a delay, start continuous movement
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        onPress(direction);
      }, GAME_TICK_MS * 0.9); // Make continuous movement slightly faster than one-off moves
    }, 200);
  };

  const handlePressEnd = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  return (
    <button
      onTouchStart={(e) => { e.preventDefault(); handlePressStart(); }}
      onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(); }}
      onMouseDown={(e) => { e.preventDefault(); handlePressStart(); }}
      onMouseUp={(e) => { e.preventDefault(); handlePressEnd(); }}
      onMouseLeave={(e) => { if (e.buttons === 1) handlePressEnd(); }}
      className={`w-16 h-16 bg-slate-600 active:bg-slate-500 flex items-center justify-center text-white text-3xl transition-colors shadow-inner ${gridPlacement}`}
    >
      {children}
    </button>
  );
};


interface ControlPadProps {
    level: number;
    onDirectionPress: (direction: Direction) => void;
}

const ControlPad: React.FC<ControlPadProps> = ({ level, onDirectionPress }) => {
    return (
        <div className="bg-slate-700/50 p-2 rounded-xl border border-slate-600 w-full h-full select-none">
            <div className="flex justify-between items-center">
                {/* Retro D-Pad */}
                <div className="relative w-48 h-48">
                    <DPadButton onPress={onDirectionPress} direction={Direction.Up} gridPlacement="absolute top-0 left-1/2 -translate-x-1/2 rounded-t-2xl">▲</DPadButton>
                    <DPadButton onPress={onDirectionPress} direction={Direction.Left} gridPlacement="absolute left-0 top-1/2 -translate-y-1/2 rounded-l-2xl">◀</DPadButton>
                    <DPadButton onPress={onDirectionPress} direction={Direction.Right} gridPlacement="absolute right-0 top-1/2 -translate-y-1/2 rounded-r-2xl">▶</DPadButton>
                    <DPadButton onPress={onDirectionPress} direction={Direction.Down} gridPlacement="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b-2xl">▼</DPadButton>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-600"></div>
                </div>

                {/* Level Display */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
                    <h2 className="text-xl font-bold text-pink-400">Level</h2>
                    <p className="text-3xl font-mono text-white">{level}</p>
                </div>

                 {/* Empty space for balance */}
                <div className="w-48 h-48 flex justify-center items-center">
                </div>
            </div>
        </div>
    );
};

export default ControlPad;
