const express = require('express');
const cors = require("cors");

const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Helper function to translate the level layout into game objects
function translateLayoutToGameObjects(levelLayout) {
  const levelData = {
    playerStart: null,
    goal: null,
    blocks: [],
    traps: [],
    width: levelLayout[0].length * 32, // Set width dynamically based on the number of columns
    height: levelLayout.length * 32 // Set height dynamically based on the number of rows
  };

  const blockWidth = 32;
  const blockHeight = 32;

  for (let y = 0; y < levelLayout.length; y++) {
    for (let x = 0; x < levelLayout[y].length; x++) {
      const cell = levelLayout[y][x];

      // Handle Player Start (P)
      if (cell === 'P') {
        levelData.playerStart = { x: x * blockWidth, y: y * blockHeight };
      }
      // Handle Goal (G)
      else if (cell === 'G') {
        levelData.goal = { x: x * blockWidth, y: y * blockHeight };
      }
      // Handle Traps (T)
      else if (cell === 'T') {
        levelData.traps.push({ x: x * blockWidth, y: y * blockHeight, width: blockWidth, height: blockHeight });
      }
      // Handle Walls (W)
      else if (cell === 'W') {
        levelData.blocks.push({ x: x * blockWidth, y: y * blockHeight, width: blockWidth, height: blockHeight });
      }
    }
  }

  return levelData;
}

// Sample Level (static)
app.get('/api/levels/1', (req, res) => {
  const levelLayout = level = [
    ['W','W','W','W','W','W','W','W',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','W'],
    ['W','P',' ',' ',' ',' ','T',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','G','W'],
    ['W',' ',' ',' ',' ',' ','T',' ',' ',' ','W','W','W',' ',' ',' ',' ',' ',' ','W'],
    ['W',' ',' ',' ',' ',' ','T',' ',' ',' ',' ',' ',' ',' ',' ','W','W',' ',' ','W'],
    ['W',' ',' ',' ',' ',' ','W','W','W',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','W'],
    ['W',' ',' ',' ',' ',' ',' ',' ','W',' ',' ',' ',' ',' ',' ',' ','T','T','T','W'],
    ['W',' ',' ','W','W','W',' ',' ','W','T','T','W','W',' ',' ',' ',' ',' ',' ',' '],
    ['W',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    ['W',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','W','W',' ',' ',' ',' '],
    ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
]
;

  const levelData = translateLayoutToGameObjects(levelLayout);

  res.json(levelData); // Return the translated level data, including width and height
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


// Leaderboard API
const LEADERBOARD_DIR = path.join(__dirname, 'leaderboards');

// Ensure leaderboard folder exists
if (!fs.existsSync(LEADERBOARD_DIR)) {
  fs.mkdirSync(LEADERBOARD_DIR);
}

// Utility: Get path to leaderboard file
const getLeaderboardPath = (levelId) => path.join(LEADERBOARD_DIR, `level-${levelId}.json`);

// Utility: Load leaderboard from file
const loadLeaderboard = (levelId) => {
  const filePath = getLeaderboardPath(levelId);
  if (!fs.existsSync(filePath)) return [];
  try {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading leaderboard for level ${levelId}:`, err);
    return [];
  }
};

// Utility: Save leaderboard to file
const saveLeaderboard = (levelId, leaderboard) => {
  const filePath = getLeaderboardPath(levelId);
  fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2));
};

app.get('/api/leaderboard/:levelId', (req, res) => {
  const { levelId } = req.params;
  const leaderboard = loadLeaderboard(levelId);
  res.json(leaderboard.slice(0, 5)); // Return top 5
});

app.post('/api/leaderboard/:levelId', (req, res) => {
  const { levelId } = req.params;
  const { playerName, timeMs } = req.body;

  if (typeof playerName !== 'string' || typeof timeMs !== 'number') {
    return res.status(400).json({ error: 'Invalid playerName or timeMs' });
  }

  const leaderboard = loadLeaderboard(levelId);
  
  // Push and sort the new score
  leaderboard.push({ playerName, timeMs, date: new Date().toISOString() });
  leaderboard.sort((a, b) => a.timeMs - b.timeMs);

  // Keep only top 5
  const top5 = leaderboard.slice(0, 5);

  saveLeaderboard(levelId, top5);

  res.json({ success: true, leaderboard: top5 });
});
