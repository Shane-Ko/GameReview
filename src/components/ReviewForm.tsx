import { useState } from "react";

interface Props {
    gameId: number | string;             // 어느 게임의 리뷰인지
    onSubmitted: () => void;    // 제출 성공 시 알림
    onCancel: () => void;
}

export default function ReviewForm({ gameId, onSubmitted }: Props) {
    // 입력값 상태
    const [author, setAuthor] = useState("");
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");
    const [playTime, setPlayTime] = useState<number | "">("");

    // 제출
    const handleSubmit = async () => {
        if (!author.trim() || !content.trim()) {
            alert("작성자와 내용을 입력해주세요");
            return;
        }

        const newReview = {
            gameId: Number(gameId),
            author,
            rating,
            content,
            playTime: Number(playTime) || 0,
            createdAt: new Date().toISOString(),
        };

        // 1. 리뷰 등록
        const res = await fetch("http://localhost:3000/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newReview),
        });

        if (res.ok) {
            // 2. 이 게임의 모든 리뷰 다시 가져오기
            const reviewsRes = await fetch(`http://localhost:3000/reviews?gameId=${gameId}`);
            const allReviews = await reviewsRes.json();

            // 3. 평균 계산
            const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;
            const reviewCount = allReviews.length;

            // 4. game 업데이트 (PATCH)
            await fetch(`http://localhost:3000/games/${gameId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating: Number(avgRating.toFixed(1)),
                    reviewCount
                }),
            });

            onSubmitted();
            setAuthor("");
            setContent("");
            setRating(5);
            setPlayTime("");
        }
    };

    // JSX
    return (
        <div className="review-form">
            {/* 작성자 input */}
            <input
                type="text"
                placeholder="닉네임"
                value={author}
                onChange={e => setAuthor(e.target.value)}
            />

            {/* 별점 select */}
            <select value={rating} onChange={e => setRating(Number(e.target.value))}>
                <option value={5}>★★★★★</option>
                <option value={4}>★★★★</option>
                <option value={3}>★★★</option>
                <option value={2}>★★</option>
                <option value={1}>★</option>
            </select>

            {/* 플레이시간 input */}
            <input
                type="number"
                placeholder="플레이 시간(시간)"
                value={playTime}
                onChange={e => setPlayTime(e.target.value === "" ? "" : Number(e.target.value))}
            />

            {/* 내용 textarea */}
            <textarea
                placeholder="리뷰 내용"
                value={content}
                onChange={e => setContent(e.target.value)}
            />

            {/* 제출 버튼 */}
            <button onClick={handleSubmit}>리뷰 등록</button>
        </div>
    );
}
