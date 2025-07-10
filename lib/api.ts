import { HighScore } from '../types';

// The base URL will be relative to the domain the app is hosted on.
// Vercel will route requests from /api/* to the serverless function.
const API_ENDPOINT = '/api/scores';

/**
 * Retrieves the list of high scores from the backend.
 * @returns A promise that resolves to an array of HighScore objects.
 */
export const getHighScores = async (): Promise<HighScore[]> => {
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            console.error("Failed to fetch high scores:", response.statusText);
            return [];
        }
        const scores: HighScore[] = await response.json();
        return scores; // The server will return them sorted
    } catch (error) {
        console.error("Failed to retrieve high scores:", error);
        return [];
    }
};

/**
 * Saves a new high score to the backend.
 * @param newScore - The high score object to save.
 */
export const saveHighScore = async (newScore: HighScore): Promise<void> => {
    if (!newScore.name || !newScore.score) return;

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newScore),
        });

        if (!response.ok) {
           const errorData = await response.json();
           console.error("Failed to save high score:", errorData.error || response.statusText);
        }
    } catch (error) {
        console.error("Failed to save high score:", error);
    }
};