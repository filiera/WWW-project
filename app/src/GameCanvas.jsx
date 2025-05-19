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

    let lastFrameTime = performance.now();
    const fps = 120; //you can adjust this value to change the frame rate
    const frameDuration = 1000 / fps; // ~33.33 ms


    const loop = () => {

      const currentTime = performance.now();
      const deltaTime = currentTime - lastFrameTime;
      if (deltaTime < frameDuration) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      lastFrameTime = currentTime;

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
        // More aggressive resolution
        if (isColliding(p, block)) {
          const overlapLeft = p.x + p.width - block.x;
          const overlapRight = block.x + block.width - p.x;

          if (overlapLeft < overlapRight) {
            p.x -= overlapLeft;
            p.touchingWall(-1);
          } else {
            p.x += overlapRight;
            p.touchingWall(1);
          }
        }
      }


      // Trap collisions
      for (const trap of level.traps) {
        if (trap.collidesWith(p) && !p.invincible) {
          p.x = startPos.current.x;
          p.y = startPos.current.y;
        }
      }

      // Goal collision
      if (level.goal.collidesWith(p)) {
        console.log("You win!");
        p.x = startPos.current.x;
        p.y = startPos.current.y;

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
