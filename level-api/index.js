const express = require('express');
const cors = require("cors"); // Import cors

const app = express();
const PORT = 3000;

app.use(cors());


app.get('/api/levels/1', (req, res) => {
  res.json({
    playerStart: { x: 100, y: 300 },
    goal: { x: 700, y: 64 },
    blocks: [
      { x: 0, y: 368, width: 800, height: 32 },
      { x: 300, y: 200, width: 32, height: 200 }
    ],
    traps: [
      { x: 300, y: 0, width: 32, height: 200 },
      { x: 500, y: 250, width: 50, height: 50 }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});