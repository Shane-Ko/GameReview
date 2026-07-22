import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Game } from "../types";

export default function Admin() {
    const navigate = useNavigate();
    const [games, setGames] = useState<Game[]>([]);
    useEffect(() => {
        fetch("http://localhost:3000/games")
            .then(res => res.json())
            .then(data => {
                // 제목 알파벳 오름차순 정렬
                const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title));
                setGames(sorted);
            });
    }, []);

    return (
        <div className="page-container-wide">
            <div className="admin-header">
                <h1>ADMIN</h1>
                <button
                    className="add-btn"
                    onClick={() => navigate("/new")}
                >
                    + ADD NEW
                </button>
            </div>

            <div className="admin-list">
                {games.map(game => (
                    <div
                        key={game.id}
                        className="admin-item"
                        onClick={() => navigate(`/edit/${game.id}`)}
                    >
                        {game.image && (
                            <img src={game.image} alt={game.title} className="admin-thumb" />
                        )}
                        <div className="admin-item-info">
                            <span className="admin-title">{game.title}</span>
                            <span className="admin-meta">{game.developer} · {game.releaseYear}</span>
                        </div>
                        <span className="admin-arrow">›</span>
                    </div>
                ))}
            </div>
        </div>
    );
}