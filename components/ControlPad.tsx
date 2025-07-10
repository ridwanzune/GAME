
import React, { useRef } from 'react';
import { Direction, PowerUpType } from '../types';
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
      }, GAME_TICK_MS / 3); // 3x faster continuous movement
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

const PowerUpActionButton: React.FC<{
  onClick: () => void;
  type: PowerUpType | undefined;
}> = ({ onClick, type }) => {
  if (type === undefined) {
    return <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-600 flex items-center justify-center shadow-inner" />;
  }

  const styles: { [key in PowerUpType]: { icon: string; color: string } } = {
    [PowerUpType.Speed]: { icon: '⚡️', color: 'bg-cyan-500 active:bg-cyan-400' },
    [PowerUpType.Trap]: { icon: '🕸️', color: 'bg-yellow-500 active:bg-yellow-400' },
    [PowerUpType.Distraction]: { icon: '🧶', color: 'bg-pink-500 active:bg-pink-400' },
    [PowerUpType.WallBreaker]: { icon: '🔨', color: 'bg-orange-500 active:bg-orange-400' },
  };
  const style = styles[type];

  return (
    <button
      onClick={onClick}
      className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-colors shadow-inner border-4 border-slate-500 ${style.color}`}
    >
      {style.icon}
    </button>
  );
};


interface ControlPadProps {
    onDirectionPress: (direction: Direction) => void;
    onUsePowerUp: () => void;
    selectedPowerUpType: PowerUpType | undefined;
}

const ControlPad: React.FC<ControlPadProps> = ({ onDirectionPress, onUsePowerUp, selectedPowerUpType }) => {
    return (
        <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 w-full h-full select-none">
            <div className="flex justify-center items-center gap-8">
                {/* Retro D-Pad */}
                <div className="relative w-48 h-48">
                    <DPadButton onPress={onDirectionPress} direction={Direction.Up} gridPlacement="absolute top-0 left-1/2 -translate-x-1/2 rounded-t-2xl">▲</DPadButton>
                    <DPadButton onPress={onDirectionPress} direction={Direction.Left} gridPlacement="absolute left-0 top-1/2 -translate-y-1/2 rounded-l-2xl">◀</DPadButton>
                    <DPadButton onPress={onDirectionPress} direction={Direction.Right} gridPlacement="absolute right-0 top-1/2 -translate-y-1/2 rounded-r-2xl">▶</DPadButton>
                    <DPadButton onPress={onDirectionPress} direction={Direction.Down} gridPlacement="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b-2xl">▼</DPadButton>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-600"></div>
                </div>
                {/* Action Button */}
                <PowerUpActionButton onClick={onUsePowerUp} type={selectedPowerUpType} />
            </div>
        </div>
    );
};

export default ControlPad;
