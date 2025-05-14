// src/gameParts/levelLoader.js
import { Player } from "./Player";
import { Block } from "./Block";
import { Trap } from "./Trap";
import { Goal } from "./Goal";

export function loadLevel(data, canvasHeight) {
  const player = new Player(data.playerStart.x, data.playerStart.y);
  const blocks = data.blocks.map(b => new Block(b.x, b.y, b.width, b.height));
  const traps = data.traps.map(t => new Trap(t.x, t.y, t.width, t.height));
  const goal = new Goal(data.goal.x, data.goal.y, data.goal.width, data.goal.height);

  return {
    player,
    blocks,
    traps,
    goal
  };
}
