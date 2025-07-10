
import React from 'react';
import { BotState } from '../types';
import { GAME_TICK_MS, BOT_IMAGE_URL } from '../constants';

interface ThreadBotProps {
  bot: BotState;
  tileSize: number;
}

const ThreadBot: React.FC<ThreadBotProps> = ({ bot, tileSize }) => {
  const isStunned = bot.stunned > 0;

  return (
    <div
      className="absolute transition-all ease-linear flex items-center justify-center"
      style={{
        width: tileSize,
        height: tileSize,
        left: bot.x * tileSize,
        top: bot.y * tileSize,
        zIndex: 9,
        transitionDuration: `${GAME_TICK_MS}ms`,
      }}
    >
      <img
        src={BOT_IMAGE_URL}
        alt="Thread Bot"
        className={`w-full h-full object-contain transition-all ${isStunned ? 'animate-pulse opacity-50' : ''}`}
        style={{
          transform: 'scale(1.2)',
        }}
      />
    </div>
  );
};

export default ThreadBot;
