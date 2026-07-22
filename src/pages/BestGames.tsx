import { useEffect, useState } from "react";
import type { Game } from "../types";
import GameCard from "../components/GameCard";
import GameDetailModal from "../components/GameDetailModal";
import type { Genre, Review } from "../types";

export default function BestGames() {
    const [games, setGames] = useState<Game[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [sortBy, setSortBy] = useState<"rating" | "reviewCount">("rating");

    const fetchGames = () => {
        fetch("http://localhost:3000/games")
            .then(res => res.json())
            .then(setGames);
    };

    const fetchReviews = () => {
        fetch("http://localhost:3000/reviews")
            .then(res => res.json())
            .then(setReviews);
    };

    const refreshAll = () => {
        fetchGames();
        fetchReviews();
    };

    useEffect(() => {
        fetchGames();
        fetch("http://localhost:3000/genres").then(res => res.json()).then(setGenres);
        fetchReviews();
    }, [sortBy]);   // sortBy 바뀌면 다시 fetch

    // Top 10만 표시
    const topGames = games.slice(0, 10);

    return (
        <div>
            <div className="best-header">
                <p className="hero-tagline">— HALL OF LEGENDS —</p>
                <h1 className="hero-title">BEST GAMES</h1>
                <p className="best-subtitle">역대 최고의 평가를 받은 게임들</p>
            </div>

            <div className="sort-buttons">
                <button
                    className={sortBy === "rating" ? "active" : ""}
                    onClick={() => setSortBy("rating")}
                >
                    평점 순
                </button>
                <button
                    className={sortBy === "reviewCount" ? "active" : ""}
                    onClick={() => setSortBy("reviewCount")}
                >
                    리뷰 많은 순
                </button>
            </div>

            <div className="best-grid">
                {topGames.map((game, index) => (
                    <div key={game.id} className="best-item">
                        <span className="best-rank">#{index + 1}</span>
                        <GameCard
                            game={game}
                            onClick={() => setSelectedGame(game)}
                        />
                    </div>
                ))}
            </div>

            {selectedGame && (
                <GameDetailModal
                    game={selectedGame}
                    genre={genres.find(g => Number(g.id) === Number(selectedGame.genreId))}
                    reviews={reviews.filter(r => Number(r.gameId) === Number(selectedGame.id))}
                    onReview={refreshAll}
                    onClose={() => setSelectedGame(null)}
                />
            )}
        </div>
    );
}