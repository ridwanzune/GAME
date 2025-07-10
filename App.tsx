
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { GameStatus, Direction, PowerUpType } from './types';
import GameBoard from './components/GameBoard';
import Modal from './components/Modal';
import Leaderboard from './components/Leaderboard';
import { DEFAULT_TILE_SIZE, MAZE_WIDTH, MAZE_HEIGHT } from './constants';
import ControlPad from './components/ControlPad';

const PowerUpInventoryIcon: React.FC<{ type: PowerUpType; onClick: () => void; isSelected?: boolean }> = ({ type, onClick, isSelected }) => {
  const styles: { [key in PowerUpType]: { icon: string; color: string; key: string } } = {
    [PowerUpType.Speed]: { icon: '⚡️', color: 'bg-cyan-500 hover:bg-cyan-400', key: '1' },
    [PowerUpType.Trap]: { icon: '🕸️', color: 'bg-yellow-500 hover:bg-yellow-400', key: '2' },
    [PowerUpType.Distraction]: { icon: '🧶', color: 'bg-pink-500 hover:bg-pink-400', key: '3' },
    [PowerUpType.WallBreaker]: { icon: '🔨', color: 'bg-orange-500 hover:bg-orange-400', key: ' ' },
  };
  const style = styles[type];
  const selectedClass = isSelected ? 'ring-4 ring-cyan-400 shadow-lg' : 'border-4 border-slate-600';

  return (
    <button onClick={onClick} className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl md:text-3xl transition-all ${style.color} ${selectedClass}`}>
        {style.icon}
        <span className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full w-7 h-7 hidden items-center justify-center border-2 border-slate-500 font-mono md:flex">{style.key}</span>
    </button>
  );
};

export const App: React.FC = () => {
  const {
    gameStatus, level, maze, player, bots, powerUps, exit, inventory, traps, distraction,
    setGameStatus, startGame, nextLevel, movePlayer, usePowerUp
  } = useGameLogic();
  
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [tileSize, setTileSize] = useState(DEFAULT_TILE_SIZE);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [selectedPowerUpIndex, setSelectedPowerUpIndex] = useState(0);

  useEffect(() => {
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);
  }, []);

  // Reset selected power-up on new level or game start
  useEffect(() => {
    if (gameStatus === GameStatus.Playing) {
      setSelectedPowerUpIndex(0);
    }
  }, [level, gameStatus]);


  useEffect(() => {
    const calculateAndSetTileSize = () => {
      if (gameAreaRef.current) {
        const { clientWidth, clientHeight } = gameAreaRef.current;
        const tileW = Math.floor(clientWidth / MAZE_WIDTH);
        const tileH = Math.floor(clientHeight / MAZE_HEIGHT);
        setTileSize(Math.max(8, Math.min(tileW, tileH)));
      } else {
        setTileSize(DEFAULT_TILE_SIZE);
      }
    };

    calculateAndSetTileSize();
    const observer = new ResizeObserver(calculateAndSetTileSize);
    if(gameAreaRef.current) {
      observer.observe(gameAreaRef.current);
    }
    window.addEventListener('resize', calculateAndSetTileSize);

    return () => {
      window.removeEventListener('resize', calculateAndSetTileSize);
      if(gameAreaRef.current){
        observer.unobserve(gameAreaRef.current);
      }
    }
  }, [isMobile, gameStatus]);


  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameStatus !== GameStatus.Playing) return;
    
    e.preventDefault();
    let direction: Direction = Direction.None;
    switch (e.key) {
      case 'ArrowUp': case 'w': direction = Direction.Up; break;
      case 'ArrowDown': case 's': direction = Direction.Down; break;
      case 'ArrowLeft': case 'a': direction = Direction.Left; break;
      case 'ArrowRight': case 'd': direction = Direction.Right; break;
      case '1': if (inventory[0] !== undefined) usePowerUp(inventory[0], 0); break;
      case '2': if (inventory[1] !== undefined) usePowerUp(inventory[1], 1); break;
      case '3': if (inventory[2] !== undefined) usePowerUp(inventory[2], 2); break;
    }
    if (direction !== Direction.None) {
        movePlayer(direction);
    }
  }, [gameStatus, movePlayer, usePowerUp, inventory]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleStartGame = async () => {
    const trimmedName = playerNameInput.trim();
    if (trimmedName) {
      startGame(trimmedName);
    }
  };
  
  const handleUseSelectedPowerUp = () => {
    const powerUpType = inventory[selectedPowerUpIndex];
    if (powerUpType !== undefined) {
      usePowerUp(powerUpType, selectedPowerUpIndex);
      // After using a powerup, inventory re-indexes. Reset selection to the new first item.
      setSelectedPowerUpIndex(0);
    }
  };

  const handleBackToMenu = () => setGameStatus(GameStatus.Menu);
  
  const commonButtonClass = "w-full text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const isGameActive = [GameStatus.Playing, GameStatus.Paused, GameStatus.Victory, GameStatus.GameOver].includes(gameStatus);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-start p-2 md:p-4 font-sans overflow-hidden">
      <h1 className="flex-shrink-0 text-3xl md:text-4xl font-bold text-cyan-300 my-2 drop-shadow-[0_3px_3px_rgba(0,0,0,0.7)] tracking-wider">
        Poho's Great Escape
      </h1>
      
      {/* Mobile Top UI */}
      {isMobile && isGameActive && (
        <div className="flex-shrink-0 w-full flex flex-col items-center gap-2 py-2">
          {/* Inventory for selection */}
          <div className="flex justify-center items-center gap-4">
              {inventory.map((p, i) => (
                  <PowerUpInventoryIcon
                      key={i}
                      type={p}
                      isSelected={i === selectedPowerUpIndex}
                      onClick={() => setSelectedPowerUpIndex(i)}
                  />
              ))}
              {Array(3 - inventory.length).fill(0).map((_, i) => (
                  <div key={i} className="w-12 h-12 rounded-full bg-slate-700 border-4 border-slate-600"></div>
              ))}
          </div>
          {/* Level Display */}
          <div className="bg-slate-800/80 px-4 py-1 rounded-xl border-2 border-slate-600">
            <span className="text-lg font-bold text-pink-400">Level: </span>
            <span className="text-xl font-mono text-white">{level}</span>
          </div>
        </div>
      )}

      <div className="w-full flex-grow flex md:flex-row flex-col justify-start md:justify-center items-stretch md:items-center gap-4 overflow-hidden">
        {/* Game Board Container */}
        <div ref={gameAreaRef} className="relative flex justify-center items-center w-full flex-grow md:h-full">
          {isGameActive && maze.length > 0 && (
            <GameBoard maze={maze} player={player} bots={bots} powerUps={powerUps} exit={exit} traps={traps} distraction={distraction} tileSize={tileSize} />
          )}
        </div>

        {/* UI Panel - Desktop Only */}
        <div className={`w-full md:w-72 flex-shrink-0 space-y-4 ${!isMobile && isGameActive ? 'flex flex-col' : 'hidden'}`}>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-pink-400">Level: {level}</h2>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-pink-400 mb-3">Inventory</h2>
                <div className="flex space-x-2">
                    {inventory.map((p, i) => (
                        <PowerUpInventoryIcon key={i} type={p} onClick={() => usePowerUp(p, i)} />
                    ))}
                    {Array(3 - inventory.length).fill(0).map((_, i) => (
                        <div key={i} className="w-16 h-16 rounded-full bg-slate-700 border-4 border-slate-600"></div>
                    ))}
                </div>
            </div>
             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-slate-300">
                <h3 className="text-xl font-bold text-pink-400 mb-2">Controls</h3>
                 <>
                    <p><span className="font-mono bg-slate-700 px-2 py-1 rounded">WASD</span> or <span className="font-mono bg-slate-700 px-2 py-1 rounded">Arrow Keys</span> to move.</p>
                    <p><span className="font-mono bg-slate-700 px-2 py-1 rounded">1, 2, 3</span> to use power-ups.</p>
                </>
            </div>
            <div className="hidden md:block">
                <Leaderboard gameStatus={gameStatus} />
            </div>
        </div>
      </div>
        
      {/* Mobile "GameBoy" Controls */}
      {isMobile && isGameActive && (
          <div className="flex-shrink-0 w-full mb-1">
              <ControlPad
                  onDirectionPress={movePlayer}
                  onUsePowerUp={handleUseSelectedPowerUp}
                  selectedPowerUpType={inventory[selectedPowerUpIndex]}
              />
          </div>
      )}

      <Modal title="Main Menu" isOpen={gameStatus === GameStatus.Menu}>
        <div className="space-y-3">
            <button onClick={() => setGameStatus(GameStatus.NameInput)} className={`${commonButtonClass} bg-pink-600 hover:bg-pink-500`}>Play</button>
            <button onClick={() => setGameStatus(GameStatus.HighScores)} className={`${commonButtonClass} bg-cyan-600 hover:bg-cyan-500`}>High Scores</button>
            <button onClick={() => setGameStatus(GameStatus.Credits)} className={`${commonButtonClass} bg-slate-600 hover:bg-slate-500`}>Credits</button>
        </div>
      </Modal>

      <Modal title="Enter Your Name" isOpen={gameStatus === GameStatus.NameInput}>
        <p>Help Poho escape the yarn labyrinth! Reach the yarn basket 🧺 to win.</p>
        <p>Avoid the menacing Thread-Bots 🤖.</p>
        {isMobile && <p className="mt-4 text-cyan-300 font-bold">Use the on-screen D-pad and buttons to play!</p>}
        <div className="mt-4 space-y-3">
             <input type="text" placeholder="Enter your name" value={playerNameInput} onChange={(e) => setPlayerNameInput(e.target.value)} className="w-full bg-slate-900 border-2 border-slate-600 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg p-3 text-white placeholder-slate-400 transition" maxLength={15} />
            <button onClick={handleStartGame} disabled={!playerNameInput.trim()} className={`${commonButtonClass} bg-pink-600 hover:bg-pink-500 disabled:bg-pink-800`}>Start Game</button>
            <button onClick={handleBackToMenu} className={`${commonButtonClass} bg-slate-600 hover:bg-slate-500`}>Back</button>
        </div>
      </Modal>

      <Modal title="🏆 High Scores" isOpen={gameStatus === GameStatus.HighScores}>
        <div className="max-h-64 overflow-y-auto"><Leaderboard gameStatus={gameStatus} /></div>
        <button onClick={handleBackToMenu} className={`${commonButtonClass} mt-4 bg-slate-600 hover:bg-slate-500`}>Back</button>
      </Modal>

      <Modal title="Credits" isOpen={gameStatus === GameStatus.Credits}>
        <p className="text-xl">Made by</p>
        <p className="text-2xl font-bold text-cyan-300">Naziba Zaman</p>
        <button onClick={handleBackToMenu} className={`${commonButtonClass} mt-4 bg-slate-600 hover:bg-slate-500`}>Back</button>
      </Modal>

      <Modal title="Game Over" isOpen={gameStatus === GameStatus.GameOver}>
        <p className="text-xl">Poho got tangled!</p>
        <p>You reached level {level}.</p>
        <div className="my-4 border-y-2 border-slate-700 py-4 max-h-48 overflow-y-auto"><Leaderboard gameStatus={gameStatus}/></div>
        <div className="flex flex-col space-y-3 mt-2">
            <button onClick={() => setGameStatus(GameStatus.NameInput)} className={`${commonButtonClass} bg-cyan-600 hover:bg-cyan-500`}>Play Again</button>
            <button onClick={handleBackToMenu} className={`${commonButtonClass} bg-slate-600 hover:bg-slate-500`}>Main Menu</button>
        </div>
      </Modal>

      <Modal title="You Win!" isOpen={gameStatus === GameStatus.Victory}>
        <p className="text-xl">Poho escaped!</p>
        <p>You completed level {level}.</p>
        <button onClick={nextLevel} className={`${commonButtonClass} mt-4 bg-purple-600 hover:bg-purple-500`}>Next Level</button>
      </Modal>
    </div>
  );
};
