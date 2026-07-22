import type { Game } from "../types";
import type { Genres } from "../types";
import type { Review } from "../types";
import { useState } from "react";
import ReviewFormModal from "./ReviewFormModal";


interface Props {
    game: Game;
    genre?: Genres;
    reviews: Review[];   // 리뷰는 여러개니까 배열로 만들기
    onReview: () => void;
    onClose: () => void;
}

export default function GameDetailModal({ game, genre, reviews, onReview, onClose }: Props) {
    const [showForm, setShowForm] = useState(false);

    const handleDeleteReview = async (reviewId: number | string) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        // 1. 리뷰 삭제
        await fetch(`http://localhost:3000/reviews/${reviewId}`, {
            method: "DELETE",
        });

        // 2. 이 게임의 남은 리뷰 다시 가져오기
        const reviewsRes = await fetch(`http://localhost:3000/reviews?gameId=${game.id}`);
        const remainingReviews = await reviewsRes.json();

        // 3. 평균 재계산
        const avgRating = remainingReviews.length > 0
            ? remainingReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / remainingReviews.length
            : 0;
        const reviewCount = remainingReviews.length;

        // 4. game 업데이트
        await fetch(`http://localhost:3000/games/${game.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                rating: Number(avgRating.toFixed(1)),
                reviewCount
            }),
        });

        onReview();
    };

    return (
        <>
            <div className="game-modal" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="game-image">
                        <img src="#" alt={game.title} />
                    </div>
                    <button className="close-btn" onClick={onClose}>x</button>
                    <div className="game-detail">
                        <p className="head-genre">{genre?.genreName}</p>
                        <h2 className="game-title">{game.title}</h2>
                        <div className="rating-summary">
                            <p>RATING</p>
                            <p className="game-rating">{game.rating} {"⭐".repeat(game.rating)}</p>
                            <p>REVIEWS</p>
                            <p className="game-reviewers">{game.reviewCount}</p>
                            <p>GENRE</p>
                            <p className="game-genre">{genre?.genreName}</p>
                        </div>

                        <div className="game-synopsis">
                            <p className="synopsis-title">SYNOPSIS</p>
                            <p className="synopsis-text">{game.description}</p>
                        </div>

                        <div className="reviews-header">
                            <p className="reviews-title">PLAYERS REVIEW</p>
                            <button onClick={() => setShowForm(true)}>리뷰 쓰기</button>
                        </div>
                        <div className="game-reviews">
                            {reviews.map(review => (
                                <div key={review.id} className="review-item">
                                    <span className="reviews-author">{review.author}</span>
                                    <p className="review-rateStar">{"⭐".repeat(review.rating)}</p>
                                    <p className="review-content">{review.content}</p>
                                    <button
                                        className="delete-review-btn"
                                        onClick={() => handleDeleteReview(review.id)}
                                    >
                                        삭제
                                    </button>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <ReviewFormModal
                    gameId={game.id}
                    onSubmitted={onReview}
                    onClose={() => setShowForm(false)}
                />
            )}
        </>
    )
}