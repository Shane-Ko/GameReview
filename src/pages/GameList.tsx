import { useEffect, useState } from "react";
import type { Game } from "../types";

export default function GameList() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/games")
      .then(res => res.json())
      .then(data => {
        console.log("받아온 데이터:", data);
        setGames(data);
      })
      .catch(err => console.error("에러:", err));
  }, []);

  return (
    <div>
      <h1>게임 목록 ({games.length}개)</h1>
      <ul>
        {games.map(game => (
          <li key={game.id}>
            <strong>{game.title}</strong> ({game.releaseYear}) - {game.developer}
            <br />
            {game.description}
          </li>
        ))}
      </ul>
    </div>
  );
}