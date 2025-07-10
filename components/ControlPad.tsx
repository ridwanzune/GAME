
import React from 'react';
import { Direction, PowerUpType } from '../types';

const DPadButton: React.FC<{
  onPress: () => void;
  gridPlacement: string;
  children: React.ReactNode;
}> = ({ onPress, gridPlacement, children }) => (
  <button
    onTouchStart={(e) => { e.preventDefault(); onPress(); }}
    onClick={(e) => { e.preventDefault(); onPress(); }}
    className={`w-12 h-12 md:w-14 md:h-14 bg-slate-600 active:bg-slate-500 rounded-lg flex items-center justify-center text-white text-2xl transition-colors ${gridPlacement}`}
  >
    {children}
  </button>
);

const PowerUpButton: React.FC<{ type: PowerUpType; onClick: () => void }> = ({ type, onClick }) => {
  const styles: { [key in PowerUpType]: { icon: string; color: string } } = {
    [PowerUpType.Speed]: { icon: '⚡️', color: 'bg-cyan-500' },
    [PowerUpType.Trap]: { icon: '🕸️', color: 'bg-yellow-500' },
    [PowerUpType.Distraction]: { icon: '🧶', color: 'bg-pink-500' },
  };
  const style = styles[type];
  return (
    <button
      onClick={onClick}
      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all border-4 border-slate-900 active:scale-95 ${style.color}`}
    >
      {style.icon}
    </button>
  );
};

interface ControlPadProps {
    level: number;
    inventory: PowerUpType[];
    onDirectionPress: (direction: Direction) => void;
    onPowerUpPress: (type: PowerUpType, index: number) => void;
}

const ControlPad: React.FC<ControlPadProps> = ({ level, inventory, onDirectionPress, onPowerUpPress }) => {
    return (
        <div className="bg-slate-700/50 p-2 rounded-xl border border-slate-600 w-full h-full select-none">
            <div className="flex justify-between items-center">
                {/* D-Pad */}
                <div className="grid grid-cols-3 grid-rows-3 gap-1 w-[156px] h-[156px] md:w-[180px] md:h-[180px]">
                    <DPadButton onPress={() => onDirectionPress(Direction.Up)} gridPlacement="col-start-2">▲</DPadButton>
                    <DPadButton onPress={() => onDirectionPress(Direction.Left)} gridPlacement="row-start-2">◀</DPadButton>
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-500 rounded-lg row-start-2 col-start-2"></div>
                    <DPadButton onPress={() => onDirectionPress(Direction.Right)} gridPlacement="row-start-2 col-start-3">▶</DPadButton>
                    <DPadButton onPress={() => onDirectionPress(Direction.Down)} gridPlacement="row-start-3 col-start-2">▼</DPadButton>
                </div>

                {/* Level Display */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center">
                    <h2 className="text-xl font-bold text-pink-400">Level</h2>
                    <p className="text-3xl font-mono text-white">{level}</p>
                </div>

                {/* Power-Up Buttons */}
                <div className="flex flex-col space-y-2 items-center">
                    {inventory.map((p, i) => (
                        <PowerUpButton key={i} type={p} onClick={() => onPowerUpPress(p, i)} />
                    ))}
                    {Array(3 - inventory.length).fill(0).map((_, i) => (
                        <div key={i} className="w-16 h-16 rounded-full bg-slate-600/50 border-4 border-slate-900/50"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ControlPad;
