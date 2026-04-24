import { useState, useEffect, useRef, Children } from "react";

const modalSizes = {
	md : "max-w-lg",
	xl : "max-w-7xl",
}
/**
 * 북마크 추가/편집 모달
 * @param {boolean}   isOpen      - 모달 열림 여부
 * @param {function}  onClose     - () => void
 */
export default function Modal({
	title = "북마크 추가",
	size = "md",
	isOpen,
	onClose,
	children,
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

	if (!isOpen) return null;

	return (
		/* 오버레이 */
		<div
			role="dialog"
			aria-modal="true"
			aria-label={title}
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
		>
			{/* 딤 배경 */}
			<div
				className="absolute inset-0 bg-black/40 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* 모달 본체 */}
			<div className={`flex flex-col relative w-full max-h-full ${modalSizes[size]} bg-white rounded-2xl shadow-2xl overflow-hidden`}>
				{/* 헤더 */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
					<h2 className="text-base font-semibold text-slate-800">
						{title}
					</h2>
					<button
						type="button"
						aria-label="닫기"
						onClick={onClose}
						className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
					>
						<i className="ri-close-line text-lg" />
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}
