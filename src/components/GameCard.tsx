import type { Game, Genre } from "../types";

interface GameCardProps {
    game: Game;
    genre?: Genre;
    onClick: () => void;
    onLikeChange?: (id: string | number, liked: boolean) => void;
}

export default function GameCard({ game, genre, onClick, onLikeChange }: GameCardProps) {

    const handleLikeToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const newLiked = !game.isLiked;
        await fetch(`http://localhost:3000/games/${game.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isLiked: newLiked }),
        });
        onLikeChange?.(game.id, newLiked);
    };

    return (
        <div className="card" onClick={onClick}>
            <div className="card-poster">
                <div className="card-badge">{genre?.genreName}</div>
                <img src={game.image} alt={game.title} />
                <div className="fade">
                    <span className="caption">[ POSTER ]</span>
                </div>
                <button className="like-btn" onClick={handleLikeToggle}>
                    {game.isLiked ? '⭐' : '☆'}
                </button>
            </div>
            <div className="card-body">
                <h3 className="card-title">{game.title}</h3>
                <p className="card-developer">{game.developer} · {game.releaseYear}</p>
                <div className="card-meta">
                    <span className="stars">{"★".repeat(Math.round(game.rating))}</span>
                    <span className="rating">{game.rating.toFixed(1)}</span>
                    <span className="reviews">({game.reviewCount})</span>
                </div>
            </div>
        </div>
    );
}