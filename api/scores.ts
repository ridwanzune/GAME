// This is a Vercel Serverless Function that uses the web-standard Request and Response objects.

// Environment variables to be set in Vercel
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;
const SCORES_FILE_PATH = 'data/highscores.json';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${SCORES_FILE_PATH}`;

const MAX_SCORES = 5;

interface HighScore {
  name: string;
  score: number;
}

// Helper to make authenticated requests to the GitHub API
async function githubRequest(method: string, body?: object) {
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const options: RequestInit = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(GITHUB_API_URL, options);
  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    console.error(`GitHub API Error (${response.status}):`, errorText);
    throw new Error(`GitHub API request failed: ${response.statusText}`);
  }
  return response;
}

// Retrieves the scores and the file's SHA from GitHub
async function getScoresFromGithub() {
  try {
    const response = await githubRequest('GET');
    if (response.status === 404) {
      return { scores: [], sha: null }; // File doesn't exist
    }
    const data = await response.json();
    // Web-standard way to decode base64 to a UTF-8 string, replacing Buffer.
    // atob decodes base64 to a "binary string".
    const binaryString = atob(data.content);
    // We convert the binary string to a Uint8Array.
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    // TextDecoder then decodes the UTF-8 bytes into a string.
    const content = new TextDecoder().decode(bytes);
    const scores = JSON.parse(content);
    return { scores, sha: data.sha };
  } catch (error) {
    console.error("Error getting scores from GitHub:", error);
    return { scores: [], sha: null }; // Return a safe default on error
  }
}

// Main handler for Vercel Serverless Function
export default async function handler(req: Request) {
  // Handle CORS preflight requests
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
  };

  if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
    return new Response(JSON.stringify({ error: 'Server is not configured with GitHub credentials.' }), { status: 500, headers: responseHeaders });
  }

  try {
    if (req.method === 'GET') {
      const { scores } = await getScoresFromGithub();
      return new Response(JSON.stringify(scores), { status: 200, headers: responseHeaders });
    }

    if (req.method === 'POST') {
      const newScore = await req.json() as HighScore;
      if (!newScore || typeof newScore.name !== 'string' || typeof newScore.score !== 'number') {
        return new Response(JSON.stringify({ error: 'Invalid score payload' }), { status: 400, headers: responseHeaders });
      }

      const { scores: existingScores, sha } = await getScoresFromGithub();
      
      const allScores = [...existingScores, newScore];
      const sortedScores = allScores.sort((a, b) => b.score - a.score);
      const topScores = sortedScores.slice(0, MAX_SCORES);

      // Web-standard way to encode a UTF-8 string to base64, replacing Buffer.
      const jsonString = JSON.stringify(topScores, null, 2);
      // TextEncoder produces a Uint8Array of UTF-8 bytes.
      const utf8Bytes = new TextEncoder().encode(jsonString);
      // btoa expects a "binary string", so we convert byte values to characters.
      let binaryString = '';
      utf8Bytes.forEach((byte) => {
        binaryString += String.fromCharCode(byte);
      });
      const content = btoa(binaryString);
      
      const body: { message: string, content: string, sha?: string | null } = {
        message: `feat: Update high scores - ${newScore.name} reached level ${newScore.score}`,
        content,
        sha,
      };

      await githubRequest('PUT', body);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: responseHeaders });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: responseHeaders });

  } catch (error) {
    console.error('API Handler Error:', error);
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), { status: 500, headers: responseHeaders });
  }
}
