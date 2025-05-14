// src/gameParts/levelLoader.js
import { Player } from "./Player";
import { Block } from "./Block";
import { Trap } from "./Trap";
import { Goal } from "./Goal";

export function loadLevel(data) {
  const { playerStart, blocks, traps, goal, width, height } = data;

  const player = new Player(playerStart.x, playerStart.y);
  const levelBlocks = blocks.map(b => new Block(b.x, b.y, b.width, b.height));
  const levelTraps = traps.map(t => new Trap(t.x, t.y, t.width, t.height));
  const levelGoal = new Goal(goal.x, goal.y, goal.width, goal.height);

  player.maxX = width; // Set the player's maxX to the level width

  return {
    player,
    blocks: levelBlocks,
    traps: levelTraps,
    goal: levelGoal,
    width,
    height
  };
}
