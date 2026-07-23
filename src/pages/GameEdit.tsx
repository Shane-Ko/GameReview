import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Genre } from "../types";
import ConfirmModal from "../components/ConfirmModal";

export default function GameEdit() {
    const { id } = useParams();      // URL의 :id 부분
    const navigate = useNavigate();
    const [genres, setGenres] = useState<Genre[]>([]);

    // 폼 입력 상태
    const [title, setTitle] = useState("");
    const [developer, setDeveloper] = useState("");
    const [releaseYear, setReleaseYear] = useState<number | "">("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [genreId, setGenreId] = useState<number>(1);
    const [tags, setTags] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    // 초기 데이터 로드
    useEffect(() => {
        // 장르 목록
        fetch("http://localhost:3000/genres")
            .then(res => res.json())
            .then(setGenres);

        // 기존 게임 데이터 → 폼에 채우기
        fetch(`http://localhost:3000/games/${id}`)
            .then(res => res.json())
            .then(game => {
                setTitle(game.title);
                setDeveloper(game.developer);
                setReleaseYear(game.releaseYear);
                setDescription(game.description);
                setImage(game.image);
                setGenreId(game.genreId);
                setTags(game.tags.join(", "));   // 배열 → 문자열
            });
    }, [id]);

    const handleUpdate = async () => {
        if (!title.trim() || !developer.trim()) {
            alert("제목과 개발사는 필수입니다");
            return;
        }

        const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);

        const updatedGame = {
            genreId: Number(genreId),
            title,
            developer,
            releaseYear: Number(releaseYear) || new Date().getFullYear(),
            description,
            image,
            tags: tagsArray,
        };

        const res = await fetch(`http://localhost:3000/games/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedGame),
        });

        if (res.ok) {
            navigate("/admin");
        }
    };

    // 삭제 버튼 클릭 → 모달 열기만
    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    // 모달에서 "삭제" 눌렀을 때 실제 삭제
    const handleDeleteConfirm = async () => {
        // 관련 리뷰 삭제
        const reviewsRes = await fetch(`http://localhost:3000/reviews?gameId=${id}`);
        const gameReviews = await reviewsRes.json();
        for (const review of gameReviews) {
            await fetch(`http://localhost:3000/reviews/${review.id}`, { method: "DELETE" });
        }
        // 게임 삭제
        await fetch(`http://localhost:3000/games/${id}`, { method: "DELETE" });
        navigate("/admin");
    };

    return (
        <>
            <div className="page-container-wide">
                <div className="admin-header">
                    <h1>EDIT GAME</h1>
                    <button className="delete-game-btn" onClick={handleDeleteClick}>
                        삭제
                    </button>
                </div>

                <div className="game-form">
                    <label>
                        제목 *
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </label>

                    <label>
                        개발사 *
                        <input
                            type="text"
                            value={developer}
                            onChange={e => setDeveloper(e.target.value)}
                        />
                    </label>

                    <label>
                        출시년도
                        <input
                            type="number"
                            value={releaseYear}
                            onChange={e => setReleaseYear(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                    </label>

                    <label>
                        장르
                        <select value={genreId} onChange={e => setGenreId(Number(e.target.value))}>
                            {genres.map(g => (
                                <option key={g.id} value={g.id}>{g.genreName}</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        설명
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </label>

                    <label>
                        이미지 경로
                        <input
                            type="text"
                            value={image}
                            onChange={e => setImage(e.target.value)}
                        />
                    </label>

                    <label>
                        태그 (콤마로 구분)
                        <input
                            type="text"
                            value={tags}
                            onChange={e => setTags(e.target.value)}
                        />
                    </label>

                    <div className="form-buttons">
                        <button
                            className="cancel-btn"
                            onClick={() => navigate("/admin")}
                        >
                            취소
                        </button>
                        <button
                            className="submit-btn"
                            onClick={handleUpdate}
                        >
                            수정
                        </button>
                    </div>
                </div>
            </div>

            {showConfirm && (
                <ConfirmModal
                    message={`"${title}"을(를) 삭제하시겠습니까?`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </>
    );
}