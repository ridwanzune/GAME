
import React from 'react';
import { PowerUpType } from '../types';

const PowerUpMobileIcon: React.FC<{ type: PowerUpType; onClick: () => void }> = ({ type, onClick }) => {
  const styles: { [key in PowerUpType]: { icon: string; color: string } } = {
    [PowerUpType.Speed]: { icon: '⚡️', color: 'bg-cyan-500/80' },
    [PowerUpType.Trap]: { icon: '🕸️', color: 'bg-yellow-500/80' },
    [PowerUpType.Distraction]: { icon: '🧶', color: 'bg-pink-500/80' },
  };
  const style = styles[type];
  return (
    <button onClick={onClick} className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-2xl md:text-3xl transition-all border-2 border-slate-400/50 shadow-lg ${style.color}`}>
      {style.icon}
    </button>
  );
};

interface MobileOverlayProps {
    level: number;
    inventory: PowerUpType[];
    usePowerUp: (type: PowerUpType, index: number) => void;
    onExitFullScreen: () => void;
}

const MobileOverlay: React.FC<MobileOverlayProps> = ({ level, inventory, usePowerUp, onExitFullScreen}) => {
    return (
        <div className="absolute inset-0 z-20 pointer-events-none p-2 md:p-4 flex justify-between">
            {/* Top-left corner */}
            <div className="flex flex-col items-start space-y-2">
                <div className="bg-slate-900/70 text-white py-1 px-3 rounded-lg pointer-events-auto shadow-lg">
                    <h2 className="text-lg md:text-xl font-bold text-pink-400">Level: {level}</h2>
                </div>
                 <button onClick={onExitFullScreen} className="bg-pink-600/80 text-white p-2 rounded-full shadow-lg pointer-events-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="sr-only">Exit Fullscreen</span>
                </button>
            </div>
            
            {/* Bottom-right: Inventory */}
            <div className="flex flex-col justify-end items-end space-y-2 pointer-events-auto">
                {inventory.map((p, i) => (
                    <PowerUpMobileIcon key={i} type={p} onClick={() => usePowerUp(p, i)} />
                ))}
                {Array(3 - inventory.length).fill(0).map((_, i) => (
                    <div key={i} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-700/70 border-2 border-slate-600/50 shadow-inner"></div>
                ))}
            </div>
        </div>
    );
}

export default MobileOverlay;
