interface ConfirmModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
    return (
        <div className="confirm-modal" onClick={onCancel}>
            <div className="confirm-content" onClick={(e) => e.stopPropagation()}>
                <p className="confirm-message">{message}</p>
                <div className="confirm-buttons">
                    <button className="cancel-btn" onClick={onCancel}>취소</button>
                    <button className="delete-confirm-btn" onClick={onConfirm}>삭제</button>
                </div>
            </div>
        </div>
    );
}