import type { Game } from "../types";
import type { Genres } from "../types";
import type { Review } from "../types";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useState, useEffect } from "react";
import ReviewFormModal from "./ReviewFormModal";
import ConfirmModal from "./ConfirmModal";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


interface Props {
    game: Game;
    genre?: Genres;
    reviews: Review[];   // 리뷰는 여러개니까 배열로 만들기
    onReview: () => void;
    onClose: () => void;
}

export default function GameDetailModal({ game, genre, reviews, onReview, onClose }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | string | null>(null);

    useEffect(() => {
        // 현재 스크롤 위치 저장
        const scrollY = window.scrollY;

        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            // 원래 스크롤 위치 복원
            window.scrollTo(0, scrollY);
        };
    }, []);

    // 클릭 → 대상 저장 (모달 열림)
    const handleDeleteClick = (reviewId: number | string) => {
        setDeleteTargetId(reviewId);
    };

    // 모달에서 확인 → 실제 삭제
    const handleDeleteConfirm = async () => {
        if (deleteTargetId === null) return;

        await fetch(`http://localhost:3000/reviews/${deleteTargetId}`, { method: "DELETE" });

        const reviewsRes = await fetch(`http://localhost:3000/reviews?gameId=${game.id}`);
        const remainingReviews = await reviewsRes.json();

        const avgRating = remainingReviews.length > 0
            ? remainingReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / remainingReviews.length
            : 0;

        await fetch(`http://localhost:3000/games/${game.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                rating: Number(avgRating.toFixed(1)),
                reviewCount: remainingReviews.length
            }),
        });

        setDeleteTargetId(null);   // 모달 닫기
        onReview();
    };

    const images = game.modalImages && game.modalImages.length > 0
        ? game.modalImages
        : [game.image];

    return (
        <>
            <div className="game-modal" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="game-image">
                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation
                            pagination={{ clickable: true }}
                            loop={images.length > 1}
                            className="modal-swiper"
                        >
                            {images.map((src, i) => (
                                <SwiperSlide key={i}>
                                    <img src={src} alt={`${game.title} ${i + 1}`} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    <button className="close-btn" onClick={onClose}>x</button>
                    <div className="game-detail">
                        <p className="head-genre">{genre?.genreName}</p>
                        <h2 className="game-title">{game.title}</h2>
                        <div className="modal-tagline">{game.developer} · {game.releaseYear}</div>
                        <div className="rating-summary">
                            <div className="col">
                                <span className="label">RATING</span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                    <span className="value">{game.rating.toFixed(1)}</span>
                                    <span className="stars">{"★".repeat(Math.round(game.rating))}</span>
                                </div>
                            </div>
                            <div className="divider"></div>
                            <div className="col">
                                <span className="label">REVIEWS</span>
                                <span className="value">{game.reviewCount}</span>
                            </div>
                            <div className="divider"></div>
                            <div className="col">
                                <span className="label">GENRE</span>
                                <span className="value-genre">{genre?.genreName}</span>
                            </div>
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
                                    <div className="review-head">
                                        <div className="review-author-box">
                                            <div className="review-avatar">
                                                {review.author.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="reviews-author">{review.author}</span>
                                        </div>
                                        <span className="review-rateStar">{"★".repeat(review.rating)}</span>
                                    </div>
                                    <p className="review-content">{review.content}</p>
                                    <button
                                        className="delete-review-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(review.id);
                                        }}
                                    >
                                        삭제
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {deleteTargetId !== null && (
                <ConfirmModal
                    message="정말 삭제하시겠습니까?"
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTargetId(null)}
                />
            )}

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