// src/GameCanvas.jsx
import { useEffect, useRef, useState } from "react";
import { loadLevel } from "./gameParts/LevelLoader"; // Import the new loadLevel function
import { isColliding } from "./gameParts/Collision";

export default function GameCanvas({ levelId }) {
  const canvasRef = useRef(null);
  const [level, setLevel] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const keys = useRef({});
  const justPressed = useRef({});
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fetchLevel = async () => {
      const res = await fetch(`http://localhost:3000/api/levels/${levelId}`);
      const data = await res.json();

      // Use loadLevel to parse the data and set up game objects
      const loadedLevel = loadLevel(data);
      setLevel(loadedLevel);

      startPos.current = {
        x: data.playerStart.x,
        y: data.playerStart.y
      };

      setLoaded(true);
    };

    fetchLevel();
  }, [levelId]);

  useEffect(() => {
    if (!loaded || !level) return;

    const { width, height } = level;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set the canvas size dynamically
    canvas.width = width;
    canvas.height = height;

    const handleKeyDown = (e) => {
      if (!keys.current[e.code]) {
        justPressed.current[e.code] = true;
      }
      keys.current[e.code] = true;
    };

    const handleKeyUp = (e) => {
      keys.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let animationFrameId;

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      const p = level.player;

      // Save previous position
      const prevX = p.x;
      const prevY = p.y;

      // Update the player's position (includes gravity, input, etc)
      p.update(keys.current, justPressed.current, height);

      const EPSILON = 0.1;

      // --- Vertical collision resolution ---
      for (const block of level.blocks) {
        if (isColliding(p, block)) {
          const wasAbove = prevY + p.height <= block.y + EPSILON;
          const wasBelow = prevY >= block.y + block.height - EPSILON;

          if (p.velY > 0 && wasAbove) {
            const horizontalOverlap  = 
            Math.min(p.x + p.width, block.x + block.width) - Math.max(p.x, block.x);
            const overlapThreshold = 3;
            if (horizontalOverlap  > overlapThreshold) {
              // Falling down onto block
              p.y = block.y - p.height;
              p.touchingGround();
            }
          } else if (p.velY < 0 && wasBelow) {
            // Hitting head on block
            p.y = block.y + block.height;
            p.velY = 0;
          }
        }
      }

      // --- Horizontal collision resolution ---
      for (const block of level.blocks) {
        if (isColliding(p, block)) {
          const wasLeft = prevX + p.width <= block.x + EPSILON;
          const wasRight = prevX >= block.x + block.width - EPSILON;

          if (p.velX > 0 && wasLeft) {
            // Moving right into block
            p.x = block.x - p.width;
            p.touchingWall(-1);
          } else if (p.velX < 0 && wasRight) {
            // Moving left into block
            p.x = block.x + block.width;
            p.touchingWall(1);
          }
        }
      }


      // Trap collisions
      for (const trap of level.traps) {
        if (trap.collidesWith(p) && !p.invincible) {
          p.x = startPos.current.x;
          p.y = startPos.current.y;
          p.velX = 0;
          p.velY = 0;
        }
      }

      // Goal collision
      if (level.goal.collidesWith(p)) {
        console.log("You win!");
        p.x = startPos.current.x;
        p.y = startPos.current.y;
        p.velX = 0;
        p.velY = 0;
      }

      // Draw everything
      level.blocks.forEach((b) => b.draw(ctx));
      level.traps.forEach((t) => t.draw(ctx));
      level.player.draw(ctx);
      level.goal.draw(ctx);

      animationFrameId = requestAnimationFrame(loop);
      justPressed.current = {};
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [loaded, level]);

  return <canvas ref={canvasRef} style={{ border: "1px solid black" }} />;
}
