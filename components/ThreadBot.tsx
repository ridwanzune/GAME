
import React from 'react';
import { BotState } from '../types';
import { TILE_SIZE } from '../constants';

interface ThreadBotProps {
  bot: BotState;
}

const ThreadBot: React.FC<ThreadBotProps> = ({ bot }) => {
  const isStunned = bot.stunned > 0;
  const isLured = !!bot.luredTo;

  return (
    <div
      className="absolute transition-all duration-100 ease-linear flex items-center justify-center"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        left: bot.x * TILE_SIZE,
        top: bot.y * TILE_SIZE,
        zIndex: 9,
      }}
    >
      <div className={`relative w-3/5 h-3/5 rounded-full ${isStunned ? 'bg-yellow-500 animate-pulse' : 'bg-red-600'} border-2 border-slate-400 flex items-center justify-center`}>
        {/* Eye */}
        <div className={`w-1/3 h-1/3 rounded-full ${isLured ? 'bg-pink-400' : 'bg-cyan-300'} shadow-[0_0_8px_2px_rgba(56,189,248,0.7)]`}></div>
        {/* Legs */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
          <div
            key={deg}
            className="absolute w-full h-[2px] bg-slate-400 origin-center"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <div className="absolute -right-1 -top-[2px] w-2 h-2 bg-slate-400 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreadBot;
