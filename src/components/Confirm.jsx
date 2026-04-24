const defaultMessages = {
    label : {
        delete : "삭제 확인"
    },
    guide : {
        delete : "이(가) 영구적으로 삭제됩니다."
    },
    button : {
        delete: "삭제"
    }
}


export default function Confirm({ isOpen, type, message, target, onConfirm, onCancel }) {
    if (!isOpen) return null;
    
    const confirmType = type === null ? "delete" : type;
    const deleteTarget = target ? `"${target}"` : "선택한 항목";
    

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={defaultMessages.label[confirmType]}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* 아이콘 */}
                <div className="flex flex-col items-center px-6 pt-6 pb-4 text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 text-2xl mb-3">
                        <i className="ri-delete-bin-2-line" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">
                        {message}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="font-medium text-slate-600">
                            {deleteTarget}
                        </span>{" "}
                        {defaultMessages.guide[confirmType]}
                    </p>
                </div>
                {/* 버튼 */}
                <div className="flex border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 text-sm text-slate-500 hover:bg-slate-50 transition-colors border-r border-slate-100"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                        {defaultMessages.button[confirmType]}
                    </button>
                </div>
            </div>
        </div>
    )
}