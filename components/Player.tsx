
import React, { useRef, useEffect } from 'react';
import { PlayerState, Direction } from '../types';
import { POHO_IMAGE_URL, GAME_TICK_MS } from '../constants';

interface PlayerProps {
  player: PlayerState;
  tileSize: number;
}

const Player: React.FC<PlayerProps> = ({ player, tileSize }) => {
  const lastHorizontalDirection = useRef<Direction>(Direction.Right);

  useEffect(() => {
    if (player.direction === Direction.Left || player.direction === Direction.Right) {
      lastHorizontalDirection.current = player.direction;
    }
  }, [player.direction]);

  const isFlipped = lastHorizontalDirection.current === Direction.Left;

  return (
    <div
      className="absolute transition-all ease-linear"
      style={{
        width: tileSize,
        height: tileSize,
        left: player.x * tileSize,
        top: player.y * tileSize,
        zIndex: 10,
        transitionDuration: `${GAME_TICK_MS}ms`,
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
