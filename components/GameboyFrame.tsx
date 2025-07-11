
import React, { useRef } from 'react';
import { Direction, PowerUpType } from '../types';
import { GAME_TICK_MS } from '../constants';

// --- Helper Components for Controls ---

const DPadButton: React.FC<{
  onPress: (direction: Direction) => void;
  direction: Direction;
  gridPlacement: string;
  children: React.ReactNode;
}> = ({ onPress, direction, gridPlacement, children }) => {
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handlePressStart = () => {
    handlePressEnd();
    onPress(direction);
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        onPress(direction);
      }, GAME_TICK_MS / 3);
    }, 200);
  };

  const handlePressEnd = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };
  
  const commonClasses = "bg-[#2d323b] active:bg-[#4a505a] flex items-center justify-center text-slate-400 text-2xl transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]";

  return (
    <div
      onTouchStart={(e) => { e.preventDefault(); handlePressStart(); }}
      onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(); }}
      onMouseDown={(e) => { e.preventDefault(); handlePressStart(); }}
      onMouseUp={(e) => { e.preventDefault(); handlePressEnd(); }}
      onMouseLeave={(e) => { if (e.buttons === 1) handlePressEnd(); }}
      className={`w-14 h-14 ${commonClasses} ${gridPlacement}`}
    >
      {children}
    </div>
  );
};

const GameboyButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; }> = ({ onClick, children, className }) => (
    <button onClick={onClick} className={className}>{children}</button>
);


const PowerUpIcon: React.FC<{ type: PowerUpType, isSelected?: boolean, onClick?: () => void }> = ({ type, isSelected, onClick }) => {
    const styles: { [key in PowerUpType]: { icon: string; color: string } } = {
        [PowerUpType.Speed]: { icon: '⚡️', color: 'bg-cyan-500' },
        [PowerUpType.Trap]: { icon: '🕸️', color: 'bg-yellow-500' },
        [PowerUpType.Distraction]: { icon: '🧶', color: 'bg-pink-500' },
        [PowerUpType.WallBreaker]: { icon: '🔨', color: 'bg-orange-500' },
    };
    const style = styles[type];
    const selectedClass = isSelected ? 'ring-2 ring-cyan-300' : 'ring-2 ring-transparent';
    const Tag = onClick ? 'button' : 'div';
    const cursorClass = onClick ? 'cursor-pointer' : '';


    return (
        <Tag onClick={onClick} className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${style.color} ${selectedClass} ${cursorClass} transition-all`}>
            {style.icon}
        </Tag>
    );
};

// --- Main Gameboy Frame Component ---

interface GameboyFrameProps {
    children: React.ReactNode;
    level: number;
    inventory: PowerUpType[];
    selectedPowerUpIndex: number;
    onDirectionPress: (direction: Direction) => void;
    onActionPress: () => void;
    onSelectPowerUp: (index: number) => void;
    onStartPress: () => void;
}

const GameboyFrame: React.FC<GameboyFrameProps> = ({
    children, level, inventory, selectedPowerUpIndex,
    onDirectionPress, onActionPress, onSelectPowerUp, onStartPress
}) => {
    const noiseStyle = {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.02)), radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)`,
        backgroundSize: 'auto, 3px 3px',
    };

    const selectedPowerUp = inventory[selectedPowerUpIndex];

    return (
        <div 
            className="relative w-full max-w-sm h-[95vh] max-h-[800px] flex flex-col bg-[#3a3f4a] rounded-3xl p-4 border-t-2 border-l-2 border-r-4 border-b-4 border-slate-900/50 shadow-2xl select-none"
            style={noiseStyle}
        >
            {/* Screen Area */}
            <div className="relative w-full aspect-square bg-[#222] rounded-t-xl rounded-b-[40px] p-2 border-2 border-slate-800 shadow-[inset_0_4px_10px_rgba(0,0,0,0.7)] flex flex-col items-center">
                <div className="w-[95%] h-full bg-[#0d2a29] rounded-lg p-2 flex flex-col items-center justify-start gap-1 border-2 border-black">
                   {/* Top Bar inside screen */}
                    <div className="w-full flex justify-between items-center px-1">
                        <h1 className="text-sm font-bold text-cyan-400/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)] tracking-tighter">Poho's Great Escape</h1>
                        <div className="flex items-center gap-1">
                             {inventory.map((p, i) => (
                                <PowerUpIcon key={i} type={p} isSelected={i === selectedPowerUpIndex} onClick={() => onSelectPowerUp(i)} />
                            ))}
                            {Array(3 - inventory.length).fill(0).map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-slate-800/50 border-2 border-slate-700"></div>
                            ))}
                        </div>
                    </div>
                    {/* Game Board */}
                    <div className="flex-grow w-full h-[calc(100%-4rem)] relative">
                       {children}
                    </div>
                    {/* Level Display */}
                    <p className="text-pink-400/90 font-mono text-lg">Level: {level}</p>
                </div>
            </div>

            {/* Controls Area */}
            <div className="flex-grow flex flex-col justify-end pb-8">
                <div className="w-full flex justify-end px-8 mb-[-2.5rem] z-10">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <GameboyButton 
                            onClick={onActionPress} 
                            className="w-20 h-20 bg-[#c0392b] active:bg-[#e74c3c] rounded-full text-white text-3xl font-bold transition-colors shadow-[2px_2px_5px_rgba(0,0,0,0.5),_inset_2px_2px_5px_rgba(255,255,255,0.3),_inset_-2px_-2px_5px_rgba(0,0,0,0.3)] flex items-center justify-center"
                        >
                            A
                        </GameboyButton>
                        {selectedPowerUp !== undefined && (
                             <div className="absolute -top-1 -right-1 text-2xl pointer-events-none">
                                <PowerUpIcon type={selectedPowerUp}/>
                             </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-center items-center px-4">
                    <div className="relative w-40 h-40">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-[#2d323b]"></div>
                        <DPadButton onPress={onDirectionPress} direction={Direction.Up} gridPlacement="absolute top-0 left-1/2 -translate-x-1/2 rounded-t-md">▲</DPadButton>
                        <DPadButton onPress={onDirectionPress} direction={Direction.Left} gridPlacement="absolute left-0 top-1/2 -translate-y-1/2 rounded-l-md">◀</DPadButton>
                        <DPadButton onPress={onDirectionPress} direction={Direction.Right} gridPlacement="absolute right-0 top-1/2 -translate-y-1/2 rounded-r-md">▶</DPadButton>
                        <DPadButton onPress={onDirectionPress} direction={Direction.Down} gridPlacement="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b-md">▼</DPadButton>
                    </div>
                </div>
                <div className="flex justify-center items-center gap-4 mt-4">
                    <GameboyButton onClick={onStartPress} className="w-16 h-8 bg-[#2d323b] active:bg-[#4a505a] rounded-full text-slate-400 text-xs font-bold tracking-widest shadow-inner">START</GameboyButton>
                </div>

                {/* Speaker Grill */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-[3px]">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="w-12 h-[2px] bg-black/30 rounded-full"></div>
                    ))}
                </div>
            </div>
            
            {/* Decorative Text */}
            <p className="absolute top-[52%] left-10 text-xs text-[#2d323b] font-bold tracking-wider">VOL.</p>
            <div className="absolute top-[55%] left-10 flex flex-col gap-2">
                <div className="w-5 h-5 rounded-full bg-[#2d323b] shadow-inner"></div>
                <div className="w-5 h-5 rounded-full bg-[#2d323b] shadow-inner"></div>
            </div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-[#2d323b] font-bold tracking-widest">POWER</p>

        </div>
    );
};

export default GameboyFrame;