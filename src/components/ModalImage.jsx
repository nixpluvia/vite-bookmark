import { useCallback, useEffect } from "react";

/**
 * 이미지 확대 보기 모달
 * @param {boolean} isOpen
 * @param {function} onClose
 */
export default function ModalImage({
	isOpen,
	imageUrl,
	onClose,
}) {
	// Escape 키로 닫기
	useEffect(() => {
		if (!isOpen) return;
		const handler = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handler);
		return () => {
			window.removeEventListener("keydown", handler);
		};
	}, [isOpen, onClose]);


	const handleModalClose = useCallback(() => {
		onClose();
	}, [onClose]);

	if (!isOpen) return null;
	
	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="이미지 확대 보기"
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
		>
			<div
				className="absolute inset-0 bg-black/40 backdrop-blur-sm"
				onClick={handleModalClose}
			/>

			<div className="flex flex-col relative w-full max-h-full max-w-7xl overflow-hidden rounded-2xl bg-white shadow-2xl">
				<div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
					<h2 className="text-base font-semibold text-slate-800">
						이미지 확대 보기
					</h2>
					<button
						type="button"
						aria-label="닫기"
						onClick={handleModalClose}
						className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
					>
						<i className="ri-close-line text-lg" />
					</button>
				</div>

				<div className="flex align-center justify-center overflow-auto grow gap-5 px-6 py-5">
					<img src={imageUrl} alt="확대된 이미지" className="w-auto h-auto rounded-lg" />
				</div>
			</div>
		</div>
	);
}
