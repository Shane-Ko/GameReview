// type 불러오기(type 을 안써도 작동에 문제는 없는듯?)
import type { Game } from "../types"; 

interface GameCardProps {
    game: Game;     // 표시할 게임 데이터
    onClick: () => void;    // 클릭 시 부모가 실행할 함수
}

/*
function GameCard(props: GameCardProps) 도 가능
그럼 props.game.title 이런 식으로 사용
*/
export default function GameCard({game, onClick}: GameCardProps) {
    return (
        <div className="game-card" onClick={onClick}>
            <img src={game.image} alt={game.title} />
            
            <h2 className="game-title">{game.title}</h2>
            
            <p className="game-description">{game.description}</p>
            
            <p className="game-meta">{game.developer}ㆍ{game.releaseYear}</p>
            
            {/* 소수점 처리 */}
            <p className="game-rate">⭐{game.rating.toFixed(1)} ({game.reviewCount})</p>
            
            <div className="game-tag">
                {game.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                ))}
            </div>

        </div>
    );
}