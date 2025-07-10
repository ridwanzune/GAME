import { useState, useEffect, useCallback } from 'react';
import { GameStatus, Cell, PlayerState, BotState, PowerUp, PowerUpType, Trap, Position, Direction } from '../types';
import { MAZE_WIDTH, MAZE_HEIGHT, BOT_INITIAL_SPEED, GAME_TICK_MS, POWERUP_COUNT, SPEED_BOOST_DURATION, SPEED_BOOST_MULTIPLIER, BOT_STUN_DURATION, TRAP_DURATION, DISTRACTION_DURATION, BOT_PATH_RECALCULATION_CHANCE } from '../constants';
import { saveHighScore } from '../lib/api';
import { playSound } from '../lib/sounds';

// A robust way to get numeric enum values for power-up types.
const POWERUP_TYPES = Object.values(PowerUpType).filter(v => typeof v === 'number') as PowerUpType[];

export const useGameLogic = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Menu);
  const [level, setLevel] = useState(1);
  const [playerName, setPlayerName] = useState('');
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [player, setPlayer] = useState<PlayerState>({ x: 1, y: 1, direction: Direction.Right, speedBoost: 0 });
  const [bots, setBots] = useState<BotState[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [traps, setTraps] = useState<Trap[]>([]);
  const [exit, setExit] = useState<Position>({ x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2 });
  const [inventory, setInventory] = useState<PowerUpType[]>([]);
  const [distraction, setDistraction] = useState<Position & { ticksRemaining: number } | null>(null);

  const generateMaze = useCallback(() => {
    const newMaze: Cell[][] = Array.from({ length: MAZE_HEIGHT }, (_, y) =>
      Array.from({ length: MAZE_WIDTH }, (_, x) => ({
        x, y,
        walls: { top: true, bottom: true, left: true, right: true },
        visited: false,
      }))
    );

    const stack: Position[] = [];
    const startPos = { x: 1, y: 1 };
    newMaze[startPos.y][startPos.x].visited = true;
    stack.push(startPos);

    while (stack.length > 0) {
      const current = stack.pop()!;
      const neighbors = [];
      const { x, y } = current;

      if (y > 1 && !newMaze[y - 2][x].visited) neighbors.push({ x, y: y - 2, wall: 'top' });
      if (y < MAZE_HEIGHT - 2 && !newMaze[y + 2][x].visited) neighbors.push({ x, y: y + 2, wall: 'bottom' });
      if (x > 1 && !newMaze[y][x - 2].visited) neighbors.push({ x: x - 2, y, wall: 'left' });
      if (x < MAZE_WIDTH - 2 && !newMaze[y][x + 2].visited) neighbors.push({ x: x + 2, y, wall: 'right' });

      if (neighbors.length > 0) {
        stack.push(current);
        const { x: nextX, y: nextY, wall } = neighbors[Math.floor(Math.random() * neighbors.length)];

        if (wall === 'top') {
          newMaze[y][x].walls.top = false;
          newMaze[y - 1][x].walls.top = false; newMaze[y - 1][x].walls.bottom = false;
          newMaze[y - 2][x].walls.bottom = false;
        } else if (wall === 'bottom') {
          newMaze[y][x].walls.bottom = false;
          newMaze[y + 1][x].walls.bottom = false; newMaze[y + 1][x].walls.top = false;
          newMaze[y + 2][x].walls.top = false;
        } else if (wall === 'left') {
          newMaze[y][x].walls.left = false;
          newMaze[y][x - 1].walls.left = false; newMaze[y][x - 1].walls.right = false;
          newMaze[y][x - 2].walls.right = false;
        } else if (wall === 'right') {
          newMaze[y][x].walls.right = false;
          newMaze[y][x + 1].walls.right = false; newMaze[y][x + 1].walls.left = false;
          newMaze[y][x + 2].walls.left = false;
        }

        newMaze[nextY][nextX].visited = true;
        stack.push({ x: nextX, y: nextY });
      }
    }
    
    // Create loops by removing some walls. Maze gets denser as level increases.
    const wallsToRemoveFactor = Math.max(0.01, 0.07 - (Math.min(level, 15) * 0.004));
    const wallsToRemove = Math.floor(MAZE_WIDTH * MAZE_HEIGHT * wallsToRemoveFactor);

    for (let i = 0; i < wallsToRemove; i++) {
        const rx = 1 + Math.floor(Math.random() * (MAZE_WIDTH - 2));
        const ry = 1 + Math.floor(Math.random() * (MAZE_HEIGHT - 2));
        if (Math.random() > 0.5 && rx < MAZE_WIDTH - 1 && newMaze[ry][rx].walls.right) { // remove right wall
            newMaze[ry][rx].walls.right = false;
            newMaze[ry][rx+1].walls.left = false;
        } else if(ry < MAZE_HEIGHT -1 && newMaze[ry][rx].walls.bottom) { // remove bottom wall
             newMaze[ry][rx].walls.bottom = false;
             newMaze[ry+1][rx].walls.top = false;
        }
    }

    return newMaze;
  }, [level]);

  const getEmptyCells = useCallback((currentMaze: Cell[][]) => {
    const emptyCells: Position[] = [];
    for (let y = 1; y < MAZE_HEIGHT; y += 2) {
      for (let x = 1; x < MAZE_WIDTH; x += 2) {
        emptyCells.push({ x, y });
      }
    }
    return emptyCells;
  }, []);

  const resetLevel = useCallback((newLevel: number) => {
    const newMaze = generateMaze();
    const emptyCells = getEmptyCells(newMaze).filter(p => !(p.x === 1 && p.y === 1));

    const newPlayer: PlayerState = { x: 1, y: 1, direction: Direction.Right, speedBoost: 0 };
    setPlayer(newPlayer);

    const newExit = { x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2 };
    setExit(newExit);
    
    // Add one bot every two levels.
    const numBots = Math.floor((newLevel - 1) / 2) + 1;
    const newBots: BotState[] = [];
    for (let i = 0; i < numBots; i++) {
        const botIndex = Math.floor(Math.random() * emptyCells.length);
        const pos = emptyCells.splice(botIndex, 1)[0];
        if (pos && (pos.x > MAZE_WIDTH/2 || pos.y > MAZE_HEIGHT/2)) { // spawn away from player
            newBots.push({ id: i, ...pos, path: [], stunned: 0 });
        } else if(emptyCells.length > 0) { // retry if too close
            const secondTryPos = emptyCells.splice(Math.floor(Math.random() * emptyCells.length), 1)[0];
            if(secondTryPos) newBots.push({ id: i, ...secondTryPos, path: [], stunned: 0 });
        }
    }
    setBots(newBots);
    
    const newPowerUps: PowerUp[] = [];
    for(let i = 0; i < POWERUP_COUNT; i++) {
        if(emptyCells.length === 0) break;
        const puIndex = Math.floor(Math.random() * emptyCells.length);
        const pos = emptyCells.splice(puIndex, 1)[0];
        if (pos) {
            const randomType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
            newPowerUps.push({id: i, ...pos, type: randomType});
        }
    }
    setPowerUps(newPowerUps);

    setMaze(newMaze);
    setTraps([]);
    setInventory([]);
    setDistraction(null);
    setLevel(newLevel);
  }, [generateMaze, getEmptyCells]);

  const startGame = useCallback((name: string) => {
    setPlayerName(name);
    resetLevel(1);
    setGameStatus(GameStatus.Playing);
  }, [resetLevel]);
  
  const nextLevel = useCallback(() => {
      const newLevel = level + 1;
      resetLevel(newLevel);
      setGameStatus(GameStatus.Playing);
  }, [level, resetLevel]);

  const usePowerUp = useCallback((type: PowerUpType, index: number) => {
    if (gameStatus !== GameStatus.Playing) return;
    
    const newInventory = [...inventory];
    newInventory.splice(index, 1);
    setInventory(newInventory);

    switch(type) {
      case PowerUpType.Speed:
        playSound('use');
        setPlayer(p => ({ ...p, speedBoost: SPEED_BOOST_DURATION }));
        break;
      case PowerUpType.Trap:
        playSound('use');
        setTraps(t => [...t, { id: Date.now(), x: player.x, y: player.y, ticksRemaining: TRAP_DURATION }]);
        break;
      case PowerUpType.Distraction:
        playSound('use');
        setDistraction({ x: player.x, y: player.y, ticksRemaining: DISTRACTION_DURATION });
        break;
      case PowerUpType.WallBreaker: {
        const { x, y, direction } = player;
        const currentCell = maze[y]?.[x];
        if (!currentCell) break;

        let wallToBreak: 'top' | 'bottom' | 'left' | 'right' | null = null;
        let neighborPos: Position | null = null;

        if (direction === Direction.Up && y > 0) { wallToBreak = 'top'; neighborPos = { x, y: y - 1 }; }
        else if (direction === Direction.Down && y < MAZE_HEIGHT - 1) { wallToBreak = 'bottom'; neighborPos = { x, y: y + 1 }; }
        else if (direction === Direction.Left && x > 0) { wallToBreak = 'left'; neighborPos = { x: x - 1, y }; }
        else if (direction === Direction.Right && x < MAZE_WIDTH - 1) { wallToBreak = 'right'; neighborPos = { x: x + 1, y }; }
        
        if (wallToBreak && currentCell.walls[wallToBreak] && neighborPos) {
            playSound('break');
            const newMaze = JSON.parse(JSON.stringify(maze)); // Deep copy
            newMaze[y][x].walls[wallToBreak] = false;
            
            const oppositeWall = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[wallToBreak];
            if (newMaze[neighborPos.y]?.[neighborPos.x]) {
                newMaze[neighborPos.y][neighborPos.x].walls[oppositeWall] = false;
            }
            setMaze(newMaze);
        }
        break;
      }
    }
  }, [inventory, player, gameStatus, maze]);
  
  const bfs = useCallback((start: Position, end: Position): Position[] => {
    if (!maze.length) return [];
    const queue: Position[][] = [[start]];
    const visited = new Set<string>([`${start.x},${start.y}`]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const pos = path[path.length - 1];

      if (pos.x === end.x && pos.y === end.y) {
        return path.slice(1);
      }
      
      const { x, y } = pos;
      const neighbors = [];
      if (!maze[y][x].walls.top) neighbors.push({ x, y: y - 1 });
      if (!maze[y][x].walls.bottom) neighbors.push({ x, y: y + 1 });
      if (!maze[y][x].walls.left) neighbors.push({ x: x - 1, y });
      if (!maze[y][x].walls.right) neighbors.push({ x: x + 1, y });

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(key)) {
          visited.add(key);
          const newPath = [...path, neighbor];
          queue.push(newPath);
        }
      }
    }
    return [];
  }, [maze]);

  const movePlayer = useCallback((direction: Direction) => {
      if (gameStatus !== GameStatus.Playing || direction === Direction.None) return;
      
      let moved = false;
      setPlayer(p => {
          let { x, y } = p;
          const currentCell = maze[y]?.[x];
          if (!currentCell) return p;

          let newDirection = p.direction;

          if (direction === Direction.Up && !currentCell.walls.top) { y -= 1; newDirection = Direction.Up; moved = true;}
          else if (direction === Direction.Down && !currentCell.walls.bottom) { y += 1; newDirection = Direction.Down; moved = true;}
          else if (direction === Direction.Left && !currentCell.walls.left) { x -= 1; newDirection = Direction.Left; moved = true;}
          else if (direction === Direction.Right && !currentCell.walls.right) { x += 1; newDirection = Direction.Right; moved = true;}
          
          if(moved) playSound('move');
          return { ...p, x, y, direction: newDirection };
      });
  }, [maze, gameStatus]);
  
  // Main Game Loop
  useEffect(() => {
    if (gameStatus !== GameStatus.Playing) return;

    const gameInterval = setInterval(() => {
      // Player speed boost
      setPlayer(p => ({ ...p, speedBoost: Math.max(0, p.speedBoost - 1) }));

      // Bot movement & AI
      setBots(currentBots => currentBots.map(bot => {
        if (bot.stunned > 0) {
          return { ...bot, stunned: bot.stunned - 1 };
        }

        const target = distraction ?? player;
        let newPath = [...bot.path]; // Create a copy to avoid state mutation
        let newLuredTo = bot.luredTo;

        const needsNewPath = newPath.length === 0 || newLuredTo?.x !== target.x || newLuredTo?.y !== target.y;
        
        if (needsNewPath) {
            if (newPath.length === 0 || Math.random() < BOT_PATH_RECALCULATION_CHANCE) {
                 const calculatedPath = bfs({x: bot.x, y: bot.y}, target);
                 if (calculatedPath.length > 0) {
                     newPath = calculatedPath;
                     newLuredTo = target;
                 }
            }
        }

        const nextPos = newPath.shift();
        
        if (nextPos) {
          return { ...bot, x: nextPos.x, y: nextPos.y, path: newPath, luredTo: newLuredTo };
        }

        return { ...bot, path: newPath, luredTo: newLuredTo };
      }));
      
      // Update traps and distractions
      setTraps(currentTraps => currentTraps.map(t => ({...t, ticksRemaining: t.ticksRemaining - 1})).filter(t => t.ticksRemaining > 0));
      setDistraction(d => d && d.ticksRemaining > 1 ? {...d, ticksRemaining: d.ticksRemaining - 1} : null);

      // Collision checks
      setPowerUps(currentPowerUps => {
        const collected = currentPowerUps.find(p => p.x === player.x && p.y === player.y);
        if (collected) {
          playSound('collect');
          if (inventory.length < 3) {
            setInventory(inv => [...inv, collected.type]);
          }
          return currentPowerUps.filter(p => p.id !== collected.id);
        }
        return currentPowerUps;
      });
      
      setBots(currentBots => currentBots.map(b => {
          const trap = traps.find(t => t.x === b.x && t.y === b.y);
          if(trap && b.stunned === 0){
             playSound('stun');
             b.stunned = BOT_STUN_DURATION;
             setTraps(ts => ts.filter(t => t.id !== trap.id));
          }
          return b;
      }));
      
      const caughtByBot = bots.some(b => b.x === player.x && b.y === player.y);
      if (caughtByBot) {
        playSound('lose');
        setGameStatus(GameStatus.GameOver);
      }
      
      // Win condition
      if (player.x === exit.x && player.y === exit.y) {
        playSound('win');
        setGameStatus(GameStatus.Victory);
      }

    }, GAME_TICK_MS / (player.speedBoost > 0 ? SPEED_BOOST_MULTIPLIER : 1));

    return () => clearInterval(gameInterval);
  }, [gameStatus, player, bots, exit, inventory, traps, bfs, distraction]);
  
  // Save score on game over
  useEffect(() => {
    if (gameStatus === GameStatus.GameOver && playerName) {
      saveHighScore({ name: playerName, score: level });
    }
  }, [gameStatus, playerName, level]);
  
  return { gameStatus, level, maze, player, bots, powerUps, exit, inventory, traps, distraction, setGameStatus, startGame, nextLevel, movePlayer, usePowerUp };
};
