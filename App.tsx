
import React, { useEffect, useCallback, useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { GameStatus, Direction, PowerUpType } from './types';
import GameBoard from './components/GameBoard';
import Modal from './components/Modal';
import Leaderboard from './components/Leaderboard';

const PowerUpInventoryIcon: React.FC<{ type: PowerUpType; onClick: () => void }> = ({ type, onClick }) => {
  const styles: { [key in PowerUpType]: { icon: string; color: string; key: string } } = {
    [PowerUpType.Speed]: { icon: '⚡️', color: 'bg-cyan-500 hover:bg-cyan-400', key: '1' },
    [PowerUpType.Trap]: { icon: '🕸️', color: 'bg-yellow-500 hover:bg-yellow-400', key: '2' },
    [PowerUpType.Distraction]: { icon: '🧶', color: 'bg-pink-500 hover:bg-pink-400', key: '3' },
  };
  const style = styles[type];
  return (
    <button onClick={onClick} className={`relative w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all border-4 border-slate-600 ${style.color}`}>
        {style.icon}
        <span className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full w-7 h-7 flex items-center justify-center border-2 border-slate-500 font-mono">{style.key}</span>
    </button>
  );
};

export const App: React.FC = () => {
  const {
    gameStatus, level, maze, player, bots, powerUps, exit, inventory, traps, distraction,
    setGameStatus, startGame, nextLevel, movePlayer, usePowerUp, enableTiltControls
  } = useGameLogic();
  
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobileCheck);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameStatus !== GameStatus.Playing) return;
    
    e.preventDefault();
    let direction: Direction = Direction.None;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        direction = Direction.Up;
        break;
      case 'ArrowDown':
      case 's':
        direction = Direction.Down;
        break;
      case 'ArrowLeft':
      case 'a':
        direction = Direction.Left;
        break;
      case 'ArrowRight':
      case 'd':
        direction = Direction.Right;
        break;
      case '1':
        if (inventory[0] !== undefined) usePowerUp(inventory[0], 0);
        break;
      case '2':
        if (inventory[1] !== undefined) usePowerUp(inventory[1], 1);
        break;
      case '3':
        if (inventory[2] !== undefined) usePowerUp(inventory[2], 2);
        break;
    }
    if (direction !== Direction.None) {
        movePlayer(direction);
    }
  }, [gameStatus, movePlayer, usePowerUp, inventory]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  const renderGameContent = () => {
      if ([GameStatus.Menu, GameStatus.NameInput, GameStatus.GameOver, GameStatus.Victory, GameStatus.Credits, GameStatus.HighScores].includes(gameStatus)) {
          return null;
      }
      return <GameBoard maze={maze} player={player} bots={bots} powerUps={powerUps} exit={exit} traps={traps} distraction={distraction} />
  }

  const handleStartGame = async () => {
    const trimmedName = playerNameInput.trim();
    if (trimmedName) {
        if(isMobile) {
            await enableTiltControls();
        }
        startGame(trimmedName);
    }
  }

  const handleBackToMenu = () => setGameStatus(GameStatus.Menu);
  
  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  };
  
  const commonButtonClass = "w-full text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      {isMobile && (
        <button onClick={handleFullScreen} className="fixed top-2 right-2 z-50 bg-pink-600 text-white p-2 rounded-full shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </button>
      )}

      <h1 className="text-4xl font-bold text-cyan-300 my-4 drop-shadow-[0_3px_3px_rgba(0,0,0,0.7)] tracking-wider">
        Poho's Great Escape
      </h1>
      
      <div className="w-full flex flex-col md:flex-row justify-center items-start gap-8">
        {/* Game Board Container */}
        <div className="flex-shrink-0 mx-auto">
          {renderGameContent()}
        </div>

        {/* UI Panel */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
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
                 {isMobile ? (
                    <p>Tilt your phone to move Poho!</p>
                ) : (
                    <>
                        <p><span className="font-mono bg-slate-700 px-2 py-1 rounded">WASD</span> or <span className="font-mono bg-slate-700 px-2 py-1 rounded">Arrow Keys</span> to move.</p>
                        <p><span className="font-mono bg-slate-700 px-2 py-1 rounded">1, 2, 3</span> to use power-ups.</p>
                    </>
                )}
            </div>
            <Leaderboard gameStatus={gameStatus} />
        </div>
      </div>

      <Modal title="Main Menu" isOpen={gameStatus === GameStatus.Menu}>
        <div className="space-y-3">
            <button onClick={() => setGameStatus(GameStatus.NameInput)} className={`${commonButtonClass} bg-pink-600 hover:bg-pink-500`}>
              Play
            </button>
            <button onClick={() => setGameStatus(GameStatus.HighScores)} className={`${commonButtonClass} bg-cyan-600 hover:bg-cyan-500`}>
              High Scores
            </button>
            <button onClick={() => setGameStatus(GameStatus.Credits)} className={`${commonButtonClass} bg-slate-600 hover:bg-slate-500`}>
              Credits
            </button>
        </div>
      </Modal>

      <Modal title="Enter Your Name" isOpen={gameStatus === GameStatus.NameInput}>
        <p>Help Poho escape the yarn labyrinth! Reach the yarn basket 🧺 to win.</p>
        <p>Avoid the menacing Thread-Bots 🤖.</p>
        {isMobile && <p className="mt-2 text-cyan-300 font-bold">You'll use TILT controls on mobile!</p>}
        <div className="mt-4 space-y-3">
             <input
                type="text"
                placeholder="Enter your name"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-600 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg p-3 text-white placeholder-slate-400 transition"
                maxLength={15}
            />
            <button 
                onClick={handleStartGame} 
                disabled={!playerNameInput.trim()}
                className={`${commonButtonClass} bg-pink-600 hover:bg-pink-500 disabled:bg-pink-800`}
            >
              Start Game
            </button>
            <button onClick={handleBackToMenu} className={`${commonButtonClass} bg-slate-600 hover:bg-slate-500`}>
                Back
            </button>
        </div>
      </Modal>

      <Modal title="🏆 High Scores" isOpen={gameStatus === GameStatus.HighScores}>
        <div className="max-h-64 overflow-y-auto">
            <Leaderboard gameStatus={gameStatus} />
        </div>
        <button onClick={handleBackToMenu} className={`${commonButtonClass} mt-4 bg-slate-600 hover:bg-slate-500`}>
            Back
        </button>
      </Modal>

      <Modal title="Credits" isOpen={gameStatus === GameStatus.Credits}>
        <p className="text-xl">Made by</p>
        <p className="text-2xl font-bold text-cyan-300">Naziba Zaman</p>
        <button onClick={handleBackToMenu} className={`${commonButtonClass} mt-4 bg-slate-600 hover:bg-slate-500`}>
            Back
        </button>
      </Modal>

      <Modal title="Game Over" isOpen={gameStatus === GameStatus.GameOver}>
        <p className="text-xl">Poho got tangled!</p>
        <p>You reached level {level}.</p>
        <div className="my-4 border-y-2 border-slate-700 py-4 max-h-48 overflow-y-auto">
            <Leaderboard gameStatus={gameStatus}/>
        </div>
        <div className="flex flex-col space-y-3 mt-2">
            <button onClick={() => setGameStatus(GameStatus.NameInput)} className={`${commonButtonClass} bg-cyan-600 hover:bg-cyan-500`}>
              Play Again
            </button>
            <button onClick={handleBackToMenu} className={`${commonButtonClass} bg-slate-600 hover:bg-slate-500`}>
              Main Menu
            </button>
        </div>
      </Modal>

      <Modal title="You Win!" isOpen={gameStatus === GameStatus.Victory}>
        <p className="text-xl">Poho escaped!</p>
        <p>You completed level {level}.</p>
        <button onClick={nextLevel} className={`${commonButtonClass} mt-4 bg-purple-600 hover:bg-purple-500`}>
          Next Level
        </button>
      </Modal>
    </div>
  );
};
