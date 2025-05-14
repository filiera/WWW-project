const express = require('express');
const cors = require("cors");

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
