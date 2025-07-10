import React, { useState, useEffect } from 'react';
import { getHighScores } from '../lib/api';
import { HighScore, GameStatus } from '../types';

interface LeaderboardProps {
    gameStatus: GameStatus;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ gameStatus }) => {
    const [scores, setScores] = useState<HighScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            try {
                const highScores = await getHighScores();
                setScores(highScores);
            } catch (error) {
                console.error("Could not fetch scores", error);
            } finally {
                setLoading(false);
            }
        };
        fetchScores();
    }, [gameStatus]); // Refreshes when game status changes, e.g., after a game over

    return (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h3 className="text-xl font-bold text-pink-400 mb-3">🏆 High Scores</h3>
            {loading ? (
                <p className="text-slate-400">Loading scores...</p>
            ) : (
                <ol className="space-y-2 text-slate-300">
                    {scores.map((score, index) => (
                        <li key={index} className="flex justify-between items-center text-lg">
                           <span>
                               <span className="font-mono mr-2">{index + 1}.</span>
                               <span className="font-bold text-cyan-300">{score.name}</span>
                           </span>
                           <span className="font-mono bg-slate-700 px-2 py-1 rounded-md">Lvl {score.score}</span>
                        </li>
                    ))}
                    {scores.length === 0 && <p className="text-slate-400">No scores yet. Be the first!</p>}
                </ol>
            )}
        </div>
    );
};

export default Leaderboard;
