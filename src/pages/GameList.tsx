import { useEffect, useState } from "react";
import type { Game, Genre, Review } from "../types";
import GameCard from "../components/GameCard";
import GameDetailModal from "../components/GameDetailModal";

export default function GameList() {
  // 1. games라는 상태 변수 만들었음 (처음엔 빈 배열 [])
  const [games, setGames] = useState<Game[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
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

  // 정렬
  const filteredGames = selectedGenreId === null
    ? games
    : games.filter(g => Number(g.genreId) === Number(selectedGenreId));
  const [sortBy, setSortBy] = useState<"none" | "rating" | "reviewCount">("none");
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "reviewCount") return b.reviewCount - a.reviewCount;
    return 0;  // 기본순
  });




  // 2️. 컴포넌트가 화면에 뜨자마자 실행 (useEffect)

  useEffect(() => {
    fetchGames();
    fetch("http://localhost:3000/genres")   //3. json-server 에 요청하기
      .then(res => res.json())              //4. JSON 으로 변환
      .then(setGenres);
    fetchReviews();
  }, []);

  // 6. games 에 db.json의 30개 게임들이 들어와있는 상태
  return (

    <div>
      <section className="hero">
        <p className="hero-tagline">— A CHRONICLE OF WORLDS —</p>
        <h1 className="hero-title">
          THE REVIEWER'S<br />
          CODEX
        </h1>
        <p className="hero-subtitle">
          깊이 있는 리뷰와 별점, 그리고 커뮤니티가 남긴 흔적들.<br />
          당신의 다음 모험을 여기서 찾으세요.
        </p>
        <div className="hero-buttons">
          <a href="#games" className="hero-btn primary">EXPLORE REVIEWS</a>
          <a href="#games" className="hero-btn">TOP RATED</a>
        </div>
      </section>
      <h1>게임 목록 ({games.length}개)</h1>

      {/* 카테고리, 장르 필터 */}
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

      {/* 정렬 토글 */}
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
      </div>

      <div className="game-grid">
        {/* map 돌면서  */}
        {sortedGames.map(game => (
          <GameCard
            key={game.id}
            game={game}       // game 을 통째로 넘겨줘야 한다
            onClick={() => setSelectedGame(game)}
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