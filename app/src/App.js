// src/App.jsx
import { useEffect, useRef } from "react";
import { Player } from "./gameParts/Player";
import { Block } from "./gameParts/Block";
import { isColliding } from "./gameParts/Collision";

export default function App() {
  const canvasRef = useRef(null);
  const keys = useRef({});
  const player = useRef(null);
  const blocks = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 800;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    player.current = new Player(100, height - 100);

    // Create walls/floor
    blocks.current = [
      new Block(0, height - 32, width, 32), // Ground
      new Block(200, height - 100, 32, 80), // Wall
      new Block(400, height - 150, 32, 150), // Wall
    ];

    const handleKeyDown = (e) => (keys.current[e.code] = true);
    const handleKeyUp = (e) => (keys.current[e.code] = false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let animationFrameId;

    const gameLoop = () => {
      ctx.clearRect(0, 0, width, height);

      const p = player.current;
      p.update(keys.current, height);

      // Simple block collision (naive and can be improved)
      p.onGround = false; // reset, will be set again if touching

      for (const block of blocks.current) {
        if (isColliding(p, block)) {
          // Basic resolution logic
          if (p.velY > 0 && p.y + p.height - p.velY <= block.y) {
            // Landing on top
            p.y = block.y - p.height;
            p.touchingGround();
          } else if (p.velY < 0 && p.y >= block.y + block.height - p.velY) {
            // Hitting bottom
            p.y = block.y + block.height;
            p.velY = 0;
          } else {
            // Hitting side
            if (p.x < block.x) {
              p.x = block.x - p.width;
              p.touchingWall(-1);
            } else {
              p.x = block.x + block.width;
              p.touchingWall(1);
            }
          }
        }
      }

      p.draw(ctx);
      blocks.current.forEach((block) => block.draw(ctx));

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
    </div>
  );
}
