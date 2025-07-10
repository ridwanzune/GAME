
import React from 'react';
import { PlayerState, Direction } from '../types';
import { TILE_SIZE, POHO_IMAGE_URL } from '../constants';

interface PlayerProps {
  player: PlayerState;
}

const Player: React.FC<PlayerProps> = ({ player }) => {
  const isFlipped = player.direction === Direction.Left;

  return (
    <div
      className="absolute transition-all duration-100 ease-linear"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        left: player.x * TILE_SIZE,
        top: player.y * TILE_SIZE,
        zIndex: 10,
      }}
    >
      <img
        src={POHO_IMAGE_URL}
        alt="Poho the Kitten"
        className="w-full h-full object-contain transition-transform duration-200"
        style={{
          transform: `scale(1.4) ${isFlipped ? 'scaleX(-1)' : ''}`,
          filter: player.speedBoost > 0 ? 'drop-shadow(0 0 8px #0ff)' : 'none',
        }}
      />
    </div>
  );
};

export default Player;
