import ReviewForm from "./ReviewForm";

interface Props {
    gameId: number | string;
    onSubmitted: () => void;
    onClose: () => void;
}

export default function ReviewFormModal({gameId, onSubmitted, onClose}: Props) {
    return (
        <div className="review-form-modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn">x</button>
                <h2>리뷰 작성</h2>
                <ReviewForm
                    gameId={gameId}
                    onSubmitted={() => {
                        onSubmitted();
                        onClose();
                    }}
                    onCancel = {onClose}
                />
            </div>
        </div>
    )
}