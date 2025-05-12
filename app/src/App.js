// src/App.jsx
import { useEffect, useRef } from "react";
import { Player } from "./gameParts/Player";
import { Block } from "./gameParts/Block";
import { isColliding } from "./gameParts/Collision";
import { Trap } from "./gameParts/Trap";

export default function App() {
  const canvasRef = useRef(null);
  const keys = useRef({});
  const player = useRef(null);
  const blocks = useRef([]);
  const traps = useRef([]);


  const justPressed = useRef({});


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
      new Block(300, 200, 32, 200), // Wall
      new Block(0, 250, 150, 32), // Flying platform
      new Block (200, 200, 64, 32),
      new Block(200, height - 100, 32, 80), // Wall
      new Block(400, height - 150, 32, 150), // Wall
    ];

    // Create traps
  traps.current = [
    new Trap(300, 0, 32, 200), // Example trap just above ground
    new Trap(500, height - 150, 50, 50),     // Another trap higher up
  ];

    const handleKeyDown = (e) => {
      if (!keys.current[e.code]) {
        justPressed.current[e.code] = true; // mark as newly pressed
      }
      keys.current[e.code] = true;
    };

    const handleKeyUp = (e) => {
      keys.current[e.code] = false;
    };


    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let animationFrameId;

    const gameLoop = () => {

      ctx.clearRect(0, 0, width, height);

      const p = player.current;
      p.update(keys.current, justPressed.current, height);

      // Simple block collision (naive and can be improved)
      p.onGround = false; // reset, will be set again if touching

      // Block logic
      for (const block of blocks.current) {
        if (isColliding(p, block)) {
          const prevBottom = p.y + p.height - p.velY;
          const prevTop = p.y - p.velY;
          const prevRight = p.x + p.width - p.velX;
          const prevLeft = p.x - p.velX;

          if (p.velY > 0 && prevBottom <= block.y) {
            // Landing on top
            p.y = block.y - p.height;
            p.touchingGround();
          } else if (p.velY < 0 && prevTop >= block.y + block.height) {
            // Hitting underside
            p.y = block.y + block.height;
            p.velY = 0; // Stop upward movement
            // Do not trigger touchingGround or touchingWall
          } else {
            // Hitting side
            if (p.velX > 0 && prevRight <= block.x) {
              // From left
              p.x = block.x - p.width;
              p.touchingWall(-1);
            } else if (p.velX < 0 && prevLeft >= block.x + block.width) {
              // From right
              p.x = block.x + block.width;
              p.touchingWall(1);
            }
          }
        }
      }

      // End block logic

      // Trap logic
      for (const trap of traps.current) {
        if (trap.collidesWith(p) && !p.invincible) {
          // Reset position
          p.x = 100;
          p.y = height - 100;
          p.velX = 0;
          p.velY = 0;
        }
      }


      // End trap logic

      // Draw everything
      blocks.current.forEach((block) => block.draw(ctx));
      traps.current.forEach((trap) => trap.draw(ctx));
      p.draw(ctx);

      animationFrameId = requestAnimationFrame(gameLoop);
      justPressed.current = {};
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
