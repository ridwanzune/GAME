import React from 'react';
import { Cell, PlayerState, BotState, PowerUp, Trap, Position, PowerUpType } from '../types';
import { MAZE_WIDTH, MAZE_HEIGHT } from '../constants';
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
  tileSize: number;
}

const PowerUpIcon: React.FC<{ type: PowerUpType }> = ({ type }) => {
  const styles: { [key in PowerUpType]: { icon: string; color: string } } = {
    [PowerUpType.Speed]: { icon: '⚡️', color: 'bg-cyan-500' },
    [PowerUpType.Trap]: { icon: '🕸️', color: 'bg-yellow-500' },
    [PowerUpType.Distraction]: { icon: '🧶', color: 'bg-pink-500' },
    [PowerUpType.WallBreaker]: { icon: '🔨', color: 'bg-orange-500' },
  };
  return <div className={`w-full h-full rounded-full flex items-center justify-center text-xl ${styles[type].color}`}>{styles[type].icon}</div>;
};

const GameBoard: React.FC<GameBoardProps> = ({ maze, player, bots, powerUps, traps, distraction, exit, tileSize }) => {
  if (!maze.length) return null;

  return (
    <div className="relative bg-slate-800" style={{ width: MAZE_WIDTH * tileSize, height: MAZE_HEIGHT * tileSize }}>
      {/* Maze Walls */}
      {maze.map((row, y) =>
        row.map((cell, x) => {
          const wallClasses = [
            cell.walls.top ? `border-t-2 md:border-t-4` : '',
            cell.walls.bottom ? `border-b-2 md:border-b-4` : '',
            cell.walls.left ? `border-l-2 md:border-l-4` : '',
            cell.walls.right ? `border-r-2 md:border-r-4` : '',
          ].join(' ');

          return (
            <div
              key={`${x}-${y}`}
              className={`absolute border-pink-400/50 box-border`}
              style={{
                width: tileSize,
                height: tileSize,
                left: x * tileSize,
                top: y * tileSize,
              }}
            >
              <div className={`w-full h-full ${wallClasses} border-pink-400/50`}></div>
            </div>
          );
        })
      )}
      
      {/* Exit */}
      <div className="absolute flex items-center justify-center" style={{ left: exit.x * tileSize, top: exit.y * tileSize, width: tileSize, height: tileSize, zIndex: 5 }}>
        <div className="w-4/5 h-4/5 bg-purple-600 rounded-full animate-pulse shadow-[0_0_15px_5px_rgba(192,132,252,0.6)] flex items-center justify-center text-2xl">🧺</div>
      </div>

      {/* PowerUps */}
      {powerUps.map(p => (
        <div key={p.id} className="absolute p-1 md:p-2" style={{ left: p.x * tileSize, top: p.y * tileSize, width: tileSize, height: tileSize, zIndex: 6 }}>
           <PowerUpIcon type={p.type} />
        </div>
      ))}
      
      {/* Traps */}
      {traps.map(t => (
        <div key={t.id} className="absolute text-xl md:text-3xl opacity-70 flex items-center justify-center" style={{ left: t.x * tileSize, top: t.y * tileSize, width: tileSize, height: tileSize, zIndex: 7 }}>
            🕸️
        </div>
      ))}

      {/* Distraction */}
      {distraction && (
         <div className="absolute text-xl md:text-3xl animate-bounce flex items-center justify-center" style={{ left: distraction.x * tileSize, top: distraction.y * tileSize, width: tileSize, height: tileSize, zIndex: 7 }}>
            🧶
        </div>
      )}

      {/* Bots */}
      {bots.map(bot => <ThreadBot key={bot.id} bot={bot} tileSize={tileSize} />)}
      
      {/* Player */}
      <Player player={player} tileSize={tileSize} />
    </div>
  );
};

export default GameBoard;
