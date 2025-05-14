// src/App.jsx
import { useState } from "react";
import GameCanvas from "./GameCanvas";

export default function App() {
  const [levelId, setLevelId] = useState(null);

  if (levelId) {
    return <GameCanvas levelId={levelId} />;
  }

  return (
    <div style={{ textAlign: "center", paddingTop: "100px" }}>
      <h1>My Platformer</h1>
      <button onClick={() => setLevelId(1)}>Start</button>
    </div>
  );
}
