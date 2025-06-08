import { useEffect, useState } from "react";
import GameCanvas from "./GameCanvas";

export default function App() {
  const [levelId, setLevelId] = useState(null);
  const [leaderboards, setLeaderboards] = useState({});

  // Function to fetch all leaderboards
  const fetchAllLeaderboards = async () => {
    const newBoards = {};
    for (let id = 1; id <= 5; id++) {
      try {
        const res = await fetch(`http://localhost:3000/api/leaderboard/${id}`);
        const data = await res.json();
        newBoards[id] = data;
      } catch (err) {
        console.error(`Failed to fetch leaderboard for level ${id}`, err);
        newBoards[id] = [];
      }
    }
    setLeaderboards(newBoards);
  };

  // Fetch leaderboards initially AND every time we return to main menu (levelId === null)
  useEffect(() => {
    if (levelId === null) {
      fetchAllLeaderboards();
    }
  }, [levelId]);

if (levelId) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100vw",
    }}>
      <GameCanvas levelId={levelId} onBackToMenu={() => setLevelId(null)} />
    </div>
  );
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
      overflowY: "auto",
      padding: "40px"
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "40px" }}>Cool Platformer</h1>

      <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", justifyContent: "center" }}>
        {[1, 2, 3, 4, 5].map(id => (
          <div key={id} style={{ textAlign: "center", width: "200px" }}>
            <button
              onClick={() => setLevelId(id)}
              style={{
                padding: "12px 24px",
                fontSize: "1.2rem",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "10px",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#4338ca"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#4f46e5"}
            >
              Level {id}
            </button>

            <div style={{
              backgroundColor: "#2e2e40",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "0.9rem"
            }}>
              <div style={{ fontWeight: "bold", marginBottom: "6px" }}>Leaderboard</div>
              {[...Array(5)].map((_, i) => {
                const entry = leaderboards[id]?.[i];
                return (
                  <div key={i}>
                    {entry
                      ? `${i + 1}. ${entry.playerName} | ${entry.timeMs}ms`
                      : `${i + 1}. ---- | ---- | ----`}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
