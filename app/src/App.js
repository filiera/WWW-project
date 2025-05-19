// src/App.jsx
import { useState } from "react";
import GameCanvas from "./GameCanvas";

export default function App() {
  const [levelId, setLevelId] = useState(null);

  if (levelId) {
    return <GameCanvas levelId={levelId} onBackToMenu={() => setLevelId(null)} />;
  }


  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#1e1e2f",
      color: "white",
      fontFamily: "sans-serif",
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "40px" }}>Cool Platformer</h1>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        {[1, 2, 3, 4, 5].map(id => (
          <button
            key={id}
            onClick={() => setLevelId(id)}
            style={{
              padding: "12px 24px",
              fontSize: "1.2rem",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#4338ca"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#4f46e5"}
          >
            Level {id}
          </button>
        ))}
      </div>
    </div>
  );
}


