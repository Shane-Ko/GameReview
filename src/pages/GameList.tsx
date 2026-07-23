import { useEffect, useState } from "react";
import type { Game, Genre, Review } from "../types";
import GameCard from "../components/GameCard";
import GameDetailModal from "../components/GameDetailModal";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

export default function GameList() {
  const [games, setGames] = useState<Game[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"none" | "rating" | "reviewCount">("none");

  const fetchReviews = () => {
    fetch("http://localhost:3000/reviews")
      .then(res => res.json())
      .then(setReviews);
  };

  const fetchGames = () => {
    fetch("http://localhost:3000/games")
      .then(res => res.json())
      .then(setGames);
  };

  const refreshAll = () => {
    fetchGames();
    fetchReviews();
  };

  // 필터 + 정렬
  const filteredGames = games
    .filter(g => selectedGenreId === null || Number(g.genreId) === Number(selectedGenreId))
    .filter(g => !showLikedOnly || g.isLiked);

  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "reviewCount") return b.reviewCount - a.reviewCount;
    return a.title.localeCompare(b.title);
  });

  const handleLikeChange = (id: string | number, liked: boolean) => {
    setGames(prev => prev.map(g => g.id === id ? { ...g, isLiked: liked } : g));
  };

  const heroImages = [
    '/hero/zelda_BotW.png',
    '/hero/monster_hunter_WB.png',
    '/hero/rdr2_2.png',
    '/hero/witcher3_1.png',
    '/hero/meccha_1.png',
  ];

  useEffect(() => {
    fetchGames();
    fetch("http://localhost:3000/genres")
      .then(res => res.json())
      .then(setGenres);
    fetchReviews();
  }, []);

  return (
    <div>
      <section className="hero">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          pagination={{ clickable: true }}
          className="hero-swiper"
        >
          {heroImages.map((src, i) => (
            <SwiperSlide key={i}>
              <div
                className="hero-slide"
                style={{ backgroundImage: `url(${src})` }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="hero-content">
          <p className="hero-tagline">— NO REFUNDS AFTER 120 MINS —</p>
          <h1 className="hero-title">
            THE REVIEWER'S<br />
            CODEX
          </h1>
          <p className="hero-subtitle">
            깊이 있는 리뷰와 별점, 그리고 커뮤니티가 남긴 흔적들.<br />
            당신의 다음 모험을 여기서 찾으세요.
          </p>
        </div>
      </section>

      {/* 장르 필터 */}
      <div className="genre-filter">
        <button
          className={selectedGenreId === null ? "active" : ""}
          onClick={() => setSelectedGenreId(null)}
        >
          전체
        </button>
        {genres.map(genre => (
          <button
            key={genre.id}
            className={selectedGenreId === genre.id ? "active" : ""}
            onClick={() => setSelectedGenreId(genre.id)}
          >
            {genre.genreName}
          </button>
        ))}
      </div>

      {/* 정렬 + 찜 토글 */}
      <div className="sort-buttons">
        <button
          className={sortBy === "none" ? "active" : ""}
          onClick={() => setSortBy("none")}
        >
          기본순
        </button>
        <button
          className={sortBy === "rating" ? "active" : ""}
          onClick={() => setSortBy("rating")}
        >
          평점 높은순
        </button>
        <button
          className={sortBy === "reviewCount" ? "active" : ""}
          onClick={() => setSortBy("reviewCount")}
        >
          리뷰 많은순
        </button>
        <button
          className={showLikedOnly ? "active" : ""}
          onClick={() => setShowLikedOnly(!showLikedOnly)}
        >
          {showLikedOnly ? "⭐ 찜목록" : "☆ 찜목록"}
        </button>
      </div>

      <div className="card-grid">     {/* ← game-grid → card-grid */}
        {sortedGames.map(game => (
          <GameCard
            key={game.id}
            game={game}
            genre={genres.find(g => Number(g.id) === Number(game.genreId))}
            onClick={() => setSelectedGame(game)}
            onLikeChange={handleLikeChange}
          />
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