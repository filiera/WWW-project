// src/GameCanvas.jsx
import { useEffect, useRef, useState } from "react";
import { loadLevel } from "./gameParts/LevelLoader";
import { isColliding } from "./gameParts/Collision";

export default function GameCanvas({ levelId, onBackToMenu }) {
  const canvasRef = useRef(null);
  const [level, setLevel] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [gameState, setGameState] = useState("playing"); // "playing" | "paused" | "won"
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const keys = useRef({});
  const justPressed = useRef({});
  const startPos = useRef({ x: 0, y: 0 });
  // For leaderboard timing
  const startTime = useRef(null);
  const endTime = useRef(null);

  const gameStateRef = useRef(gameState);


    useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const fetchLevel = async () => {
      const res = await fetch(`http://localhost:3000/api/levels/${levelId}`);
      const data = await res.json();

      // Use loadLevel to parse the data and set up game objects
      const loadedLevel = loadLevel(data);
      setLevel(loadedLevel);

      startPos.current = {
        x: data.playerStart.x,
        y: data.playerStart.y,
      };

      setGameState("playing");
      startTime.current = performance.now();
      endTime.current = null;
      setLoaded(true);
    };

    fetchLevel();
  }, [levelId, reloadTrigger]); 


  useEffect(() => {
  const handlePauseToggle = (e) => {
    if (gameStateRef.current === "won") return; // Don't allow pausing when the game is won
    if (e.code === "Escape") {
        setGameState((prev) => (prev === "playing" ? "paused" : "playing"));
    }
  };
  window.addEventListener("keydown", handlePauseToggle);
  return () => {
    window.removeEventListener("keydown", handlePauseToggle);
  };
}, []);

  useEffect(() => {
    if (!loaded || !level || gameState !== "playing") return;

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
    const frameDuration = 1000 / fps;


    const loop = () => {
      if (gameState !== "playing") {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      const currentTime = performance.now();
      const deltaTime = currentTime - lastFrameTime;
      if (deltaTime < frameDuration) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      lastFrameTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      const p = level.player;
      //const prevX = p.x;
      const prevY = p.y;
      p.update(keys.current, justPressed.current, height);

      const EPSILON = 0.1;

      for (const block of level.blocks) {
        if (isColliding(p, block)) {
          const wasAbove = prevY + p.height <= block.y + EPSILON;
          const wasBelow = prevY >= block.y + block.height - EPSILON;

          if (p.velY > 0 && wasAbove) {
            const horizontalOverlap =
              Math.min(p.x + p.width, block.x + block.width) - Math.max(p.x, block.x);
            const overlapThreshold = 3;

            if (horizontalOverlap > overlapThreshold) {
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
          startTime.current = performance.now();
        }
      }

      // Goal collision
      if (level.goal.collidesWith(p)) {
        endTime.current = performance.now();
        setGameState("won");
        return;
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

    
  }, [loaded, level, gameState]);

  const handleRetry = () => {
    setLoaded(false);
    setLevel(null);
    startTime.current = performance.now();
    endTime.current = null;
    setGameState("playing");
    setReloadTrigger((prev) => prev + 1);
    keys.current = {};
    justPressed.current = {};
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} style={{ border: "1px solid black" }} />

      {gameState === "won" && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          zIndex: 10,
        }}>
          <div style={{ backgroundColor: "#1f2937", padding: "40px 60px", borderRadius: "16px", textAlign: "center" }}>
            <h2 style={{ color: "#10b981", fontSize: "2.5rem", marginBottom: "24px" }}>
             Congratulations! 
            </h2>

              <SubmitScoreForm
                levelId={levelId}
                timeMs={Math.round(endTime.current - startTime.current)}
              />

            <button onClick={handleRetry} style={{ ...buttonStyle, marginTop: "12px" }}>
              Retry
            </button>
            <button
              onClick={onBackToMenu}
              style={{ ...buttonStyle, marginTop: "12px", backgroundColor: "#ef4444" }}
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {gameState === "paused" && (
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          fontFamily: "sans-serif",
          zIndex: 10,
        }}
      >
        <div
          style={{
            backgroundColor: "#1f2937",
            padding: "40px 60px",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "2.5rem", marginBottom: "24px" }}>Paused</h2>
          <button
            onClick={() => setGameState("playing")}
            style={buttonStyle}
          >
            Resume
          </button>
          <button
            onClick={onBackToMenu}
            style={{ ...buttonStyle, marginTop: "12px", backgroundColor: "#ef4444" }}
          >
            Back to Menu
          </button>
        </div>
      </div>
    )}

    </div>
  );

}

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "1.2rem",
  backgroundColor: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};



function SubmitScoreForm({ levelId, timeMs }) {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await fetch(`http://localhost:3000/api/leaderboard/${levelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name.trim(), timeMs })
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Score submission failed:", err);
    }
  };

  return (
    <div style={{ marginTop: "16px" }}>
      {submitted ? (
        <p style={{ color: "#10b981", fontSize: "1.1rem" }}>
          Score submitted!
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "8px" }}>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              style={{
                padding: "10px",
                fontSize: "1rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                width: "100%",
                maxWidth: "240px",
              }}
              disabled={submitted}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            Submit Score ({(timeMs / 1000).toFixed(2)}s)
          </button>
        </form>
      )}
    </div>
  );
}
