import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Genre } from "../types";

export default function GameNew() {
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
    const [modalImages, setModalImages] = useState("");

    useEffect(() => {
        fetch("http://localhost:3000/genres")
            .then(res => res.json())
            .then(setGenres);
    }, []);

    const handleSubmit = async () => {
        if (!title.trim() || !developer.trim()) {
            alert("제목과 개발사는 필수입니다");
            return;
        }

        const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);
        const modalImagesArray = modalImages
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);

        const newGame = {
            genreId: Number(genreId),
            title,
            developer,
            releaseYear: Number(releaseYear) || new Date().getFullYear(),
            description,
            image,
            modalImages: modalImagesArray.length > 0 ? modalImagesArray : [image, image, image],
            rating: 0,
            reviewCount: 0,
            tags: tagsArray,
            likeCount: 0,
            isLiked: false,
            isSaved: false,
        };

        const res = await fetch("http://localhost:3000/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newGame),
        });

        if (res.ok) {
            navigate("/admin");
        }
    };

    return (
        <div className="page-container-wide">
            <div className="admin-header">
                <h1>NEW GAME</h1>
            </div>

            <div className="game-form">
                <label>
                    제목 *
                    <input
                        type="text"
                        placeholder="게임 제목"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </label>

                <label>
                    개발사 *
                    <input
                        type="text"
                        placeholder="개발사"
                        value={developer}
                        onChange={e => setDeveloper(e.target.value)}
                    />
                </label>

                <label>
                    출시년도
                    <input
                        type="number"
                        placeholder="2024"
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
                        placeholder="게임 설명"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </label>

                <label>
                    대표 이미지 경로
                    <input
                        type="text"
                        placeholder="/images/example.png"
                        value={image}
                        onChange={e => setImage(e.target.value)}
                    />
                </label>

                <label>
                    모달 이미지 (콤마로 구분, 여러 장 - 비우면 대표 이미지 사용)
                    <input
                        type="text"
                        value={modalImages}
                        onChange={e => setModalImages(e.target.value)}
                        placeholder="/images/game_1.png, /images/game_2.png, /images/game_3.png"
                    />
                </label>

                <label>
                    태그 (콤마로 구분)
                    <input
                        type="text"
                        placeholder="오픈월드, 스토리, 싱글플레이"
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
                        onClick={handleSubmit}
                    >
                        등록
                    </button>
                </div>
            </div>
        </div>
    );
}