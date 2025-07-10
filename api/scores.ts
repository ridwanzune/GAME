// This is a Vercel Serverless Function that uses the web-standard Request and Response objects.

// IMPORTANT: For production, these should ideally be set as environment variables
// in your deployment platform (e.g., Vercel) for security reasons.
// For demonstration and direct functionality based on your request, they are hardcoded here.
const GITHUB_TOKEN = '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';
const GITHUB_REPO_OWNER = 'ridwanzune';
const GITHUB_REPO_NAME = 'GAME';
const SCORES_FILE_PATH = 'data/highscores.json'; // Path to highscores.json within your repository
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${SCORES_FILE_PATH}`;

const MAX_SCORES_DISPLAY = 10;

interface HighScore {
  name: string;
  score: number;
}

/**
 * Retrieves the raw score log and the file's SHA from GitHub.
 * Gracefully handles a 404 (file not found) by returning an empty array.
 * Throws a detailed error for other issues (e.g., bad credentials).
 */
async function getScoreLogAndSha(): Promise<{ scores: HighScore[]; sha: string | null }> {
  // In a production environment with environment variables, you would keep this check:
  // if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
  //   throw new Error('Server configuration error: Missing GitHub environment variables.');
  // }
    
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const response = await fetch(GITHUB_API_URL, { method: 'GET', headers, cache: 'no-store' });

  if (response.status === 404) {
    // This is a normal condition if no scores have been submitted yet.
    // The file will be created on the first POST request.
    return { scores: [], sha: null };
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`GitHub API GET Error: Status ${response.status}. Response: ${errorBody}`);
    throw new Error(`Failed to fetch scores from GitHub. Status: ${response.status}. Please verify your GITHUB_TOKEN and repository configuration.`);
  }

  const data = await response.json();
  if (!data.content) {
    // If content is empty but file exists, return empty scores with SHA
    return { scores: [], sha: data.sha };
  }

  // Replace Node.js Buffer with web-standard APIs for base64 decoding.
  const binaryString = atob(data.content);
  const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
  const content = new TextDecoder().decode(bytes);
  const scores = JSON.parse(content);
  return { scores, sha: data.sha };
}

// Main handler for Vercel Serverless Function
export default async function handler(req: Request) {
  // Handle CORS preflight requests for local development
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  
  const responseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0', // Ensure no caching for dynamic scores
  };

  try {
    if (req.method === 'GET') {
      const { scores: allScores } = await getScoreLogAndSha();

      // Process the entire log to generate a leaderboard of personal bests
      const playerHighScores = new Map<string, number>();
      for (const score of allScores) {
        const currentBest = playerHighScores.get(score.name) || 0;
        if (score.score > currentBest) {
          playerHighScores.set(score.name, score.score);
        }
      }

      const leaderboard = Array.from(playerHighScores.entries())
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SCORES_DISPLAY);

      return new Response(JSON.stringify(leaderboard), { status: 200, headers: responseHeaders });
    }

    if (req.method === 'POST') {
      const newScore = await req.json() as HighScore;
      if (!newScore || typeof newScore.name !== 'string' || typeof newScore.score !== 'number') {
        return new Response(JSON.stringify({ error: 'Invalid score payload' }), { status: 400, headers: responseHeaders });
      }

      const { scores: existingScores, sha } = await getScoreLogAndSha();
      const updatedScores = [...existingScores, newScore];
      
      // Replace Node.js Buffer with web-standard APIs for base64 encoding.
      const jsonString = JSON.stringify(updatedScores, null, 2); // Pretty print JSON
      const utf8Bytes = new TextEncoder().encode(jsonString);
      // btoa expects a binary string, so we convert each byte to a character.
      // String.fromCharCode.apply is used to handle large arrays safely.
      const binaryString = String.fromCharCode.apply(null, Array.from(utf8Bytes));
      const content = btoa(binaryString);
      
      const body: { message: string, content: string, sha?: string } = {
        message: `log: ${newScore.name} reached level ${newScore.score}`,
        content,
      };

      // Include SHA only if the file already exists (for updates)
      if (sha) {
        body.sha = sha;
      }

      const putHeaders = {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
      };

      const putResponse = await fetch(GITHUB_API_URL, {
        method: 'PUT',
        headers: putHeaders,
        body: JSON.stringify(body)
      });

      if (!putResponse.ok) {
        const errorText = await putResponse.text();
        console.error(`GitHub API PUT Error (${putResponse.status}):`, errorText);
        throw new Error(`Failed to save score to GitHub. This can happen if the GITHUB_TOKEN lacks 'repo' scope or if the repository name is incorrect.`);
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: responseHeaders });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: responseHeaders });

  } catch (error) {
    console.error('[API HANDLER ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: responseHeaders });
  }
}
