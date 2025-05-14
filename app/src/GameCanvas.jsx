// src/GameCanvas.jsx
import { useEffect, useRef, useState } from "react";
import { Player } from "./gameParts/Player";
import { Block } from "./gameParts/Block";
import { Trap } from "./gameParts/Trap";
import { Goal } from "./gameParts/Goal";
import { isColliding } from "./gameParts/Collision";

export default function GameCanvas({ levelId }) {
  const canvasRef = useRef(null);
  const player = useRef(null);
  const blocks = useRef([]);
  const traps = useRef([]);
  const goal = useRef(null);

  const keys = useRef({});
  const justPressed = useRef({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchLevel = async () => {
      const res = await fetch(`http://localhost:3000/api/levels/${levelId}`);
      const data = await res.json();

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const width = 800;
      const height = 400;
      canvas.width = width;
      canvas.height = height;

      player.current = new Player(data.playerStart.x, data.playerStart.y);
      goal.current = new Goal(data.goal.x, data.goal.y);

      blocks.current = data.blocks.map(
        (b) => new Block(b.x, b.y, b.width, b.height)
      );

      traps.current = data.traps.map(
        (t) => new Trap(t.x, t.y, t.width, t.height)
      );

      setLoaded(true);
    };

    fetchLevel();
  }, [levelId]);

  useEffect(() => {
    if (!loaded) return;

    const width = 800;
    const height = 400;

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

    const ctx = canvasRef.current.getContext("2d");
    let animationFrameId;

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      const p = player.current;
      p.update(keys.current, justPressed.current, height);

      // Block collisions
      for (const block of blocks.current) {
        if (isColliding(p, block)) {
          const prevBottom = p.y + p.height - p.velY;
          const prevTop = p.y - p.velY;
          const prevRight = p.x + p.width - p.velX;
          const prevLeft = p.x - p.velX;

          if (p.velY > 0 && prevBottom <= block.y) {
            p.y = block.y - p.height;
            p.touchingGround();
          } else if (p.velY < 0 && prevTop >= block.y + block.height) {
            p.y = block.y + block.height;
            p.velY = 0;
          } else {
            if (p.velX > 0 && prevRight <= block.x) {
              p.x = block.x - p.width;
              p.touchingWall(-1);
            } else if (p.velX < 0 && prevLeft >= block.x + block.width) {
              p.x = block.x + block.width;
              p.touchingWall(1);
            }
          }
        }
      }

      // Trap collisions
      for (const trap of traps.current) {
        if (trap.collidesWith(p) && !p.invincible) {
          p.x = 100;
          p.y = height - 100;
          p.velX = 0;
          p.velY = 0;
        }
      }

      // Goal collision
      if (goal.current.collidesWith(p)) {
        console.log("You win!");
        p.x = 100;
        p.y = height - 100;
        p.velX = 0;
        p.velY = 0;
      }

      // Draw
      blocks.current.forEach((b) => b.draw(ctx));
      traps.current.forEach((t) => t.draw(ctx));
      player.current.draw(ctx);
      goal.current.draw(ctx);

      animationFrameId = requestAnimationFrame(loop);
      justPressed.current = {};
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [loaded]);

  return <canvas ref={canvasRef} style={{ border: "1px solid black" }} />;
}
