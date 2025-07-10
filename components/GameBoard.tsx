
import React from 'react';
import { Cell, PlayerState, BotState, PowerUp, Trap, Position, PowerUpType } from '../types';
import { TILE_SIZE, MAZE_WIDTH, MAZE_HEIGHT } from '../constants';
import Player from './Player';
import ThreadBot from './ThreadBot';

interface GameBoardProps {
  maze: Cell[][];
  player: PlayerState;
  bots: BotState[];
  powerUps: PowerUp[];
  traps: Trap[];
  distraction: (Position & { ticksRemaining: number }) | null;
  exit: Position;
}

const PowerUpIcon: React.FC<{ type: PowerUpType }> = ({ type }) => {
  const styles: { [key in PowerUpType]: { icon: string; color: string } } = {
    [PowerUpType.Speed]: { icon: '⚡️', color: 'bg-cyan-500' },
    [PowerUpType.Trap]: { icon: '🕸️', color: 'bg-yellow-500' },
    [PowerUpType.Distraction]: { icon: '🧶', color: 'bg-pink-500' },
  };
  return <div className={`w-full h-full rounded-full flex items-center justify-center text-xl ${styles[type].color}`}>{styles[type].icon}</div>;
};

const GameBoard: React.FC<GameBoardProps> = ({ maze, player, bots, powerUps, traps, distraction, exit }) => {
  if (!maze.length) return null;

  return (
    <div className="relative bg-slate-800 mx-auto" style={{ width: MAZE_WIDTH * TILE_SIZE, height: MAZE_HEIGHT * TILE_SIZE }}>
      {/* Maze Walls */}
      {maze.map((row, y) =>
        row.map((cell, x) => {
          const wallClasses = [
            cell.walls.top ? `border-t-4` : '',
            cell.walls.bottom ? `border-b-4` : '',
            cell.walls.left ? `border-l-4` : '',
            cell.walls.right ? `border-r-4` : '',
          ].join(' ');

          return (
            <div
              key={`${x}-${y}`}
              className={`absolute border-pink-400/50 box-border`}
              style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                left: x * TILE_SIZE,
                top: y * TILE_SIZE,
              }}
            >
              <div className={`w-full h-full ${wallClasses} border-pink-400/50`}></div>
            </div>
          );
        })
      )}
      
      {/* Exit */}
      <div className="absolute flex items-center justify-center" style={{ left: exit.x * TILE_SIZE, top: exit.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, zIndex: 5 }}>
        <div className="w-4/5 h-4/5 bg-purple-600 rounded-full animate-pulse shadow-[0_0_15px_5px_rgba(192,132,252,0.6)] flex items-center justify-center text-2xl">🧺</div>
      </div>

      {/* PowerUps */}
      {powerUps.map(p => (
        <div key={p.id} className="absolute p-2" style={{ left: p.x * TILE_SIZE, top: p.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, zIndex: 6 }}>
           <PowerUpIcon type={p.type} />
        </div>
      ))}
      
      {/* Traps */}
      {traps.map(t => (
        <div key={t.id} className="absolute text-3xl opacity-70" style={{ left: t.x * TILE_SIZE, top: t.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, zIndex: 7 }}>
            🕸️
        </div>
      ))}

      {/* Distraction */}
      {distraction && (
         <div className="absolute text-3xl animate-bounce" style={{ left: distraction.x * TILE_SIZE, top: distraction.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, zIndex: 7 }}>
            🧶
        </div>
      )}

      {/* Bots */}
      {bots.map(bot => <ThreadBot key={bot.id} bot={bot} />)}
      
      {/* Player */}
      <Player player={player} />
    </div>
  );
};

export default GameBoard;

