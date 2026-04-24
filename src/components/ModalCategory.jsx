import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 카테고리 관리 모달
 * @param {boolean} isOpen
 * @param {string[]} categories
 * @param {function} onClose
 */
export default function ModalCategory({
	isOpen,
	categories,
	onUpdateCategories,
	onClose,
}) {
	const [newCategory, setNewCategory] = useState("");
	const [newCategories, setNewCategories] = useState(() =>
		categories.filter((c) => c !== "전체"),
	);
	const [error, setError] = useState("");
	const inputRef = useRef(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [isEdit, setIsEdit] = useState(false);

	const handleModalClose = useCallback(() => {
		setConfirmOpen(false);
		setDeleteTarget(null);
		onClose();
	}, [onClose]);

	useEffect(() => {
		if (!isOpen) return;
		requestAnimationFrame(() => inputRef.current?.focus());
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		const handler = (e) => {
			if (e.key === "Escape") {
        if (confirmOpen) {
          setConfirmOpen(false);
          setDeleteTarget(null);
        } else {
          handleModalClose();
        }
      }
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [isOpen, handleModalClose, confirmOpen]);

	if (!isOpen) return null;

	const handleAdd = (e) => {
		e.preventDefault();
		const name = newCategory.trim();
		if (!name) {
			setError("카테고리 이름을 입력해주세요.");
			return;
		}
		if (newCategories.includes(name)) {
			setError("이미 존재하는 카테고리입니다.");
			return;
		}
		setNewCategories((prev) => [...prev, name]);
		setNewCategory("");
		setIsEdit(true);
		inputRef.current?.focus();
	};

	const handleDeleteClick = (category) => {
		if (category === "기타") {
			alert("기타 카테고리는 삭제할 수 없습니다.");
			return;
		}
		setDeleteTarget(category);
		setConfirmOpen(true);
	};

	const handleMoveCategory = (name, direction) => {
		if (name === "전체" || direction === 0) return;

		const list = [...newCategories];
		const index = list.indexOf(name);
		if (index === -1) return;

		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= list.length) return;

		[list[index], list[targetIndex]] = [list[targetIndex], list[index]];
		setNewCategories(list);
		setIsEdit(true);
	};

	const handleDeleteCategory = () => {
		setConfirmOpen(false);
		const changeCategories = [...newCategories];
		const targetIndex = changeCategories.indexOf(deleteTarget);
		if (targetIndex < 0) return;
		changeCategories.splice(targetIndex, 1);
		setNewCategories(changeCategories);
		setDeleteTarget(null);
		setIsEdit(true);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!isEdit) return;

		onUpdateCategories(newCategories);
		handleModalClose();
	};

	return (
		<>
			<div
				role="dialog"
				aria-modal="true"
				aria-label="카테고리 관리"
				className="fixed inset-0 z-50 flex items-center justify-center p-4"
			>
				<div
					className="absolute inset-0 bg-black/40 backdrop-blur-sm"
					onClick={handleModalClose}
				/>

				<div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
					<div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
						<h2 className="text-base font-semibold text-slate-800">
							카테고리 관리
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

					<div className="flex flex-col gap-5 px-6 py-5">
						<form
							onSubmit={handleAdd}
							className="flex flex-col gap-2"
						>
							<label
								htmlFor="new-category"
								className="text-xs font-medium text-slate-600"
							>
								새 카테고리 추가
							</label>
							<div className="flex gap-2">
								<input
									ref={inputRef}
									id="new-category"
									type="text"
									value={newCategory}
									onChange={(e) => {
										setNewCategory(e.target.value);
										if (error) setError("");
									}}
									placeholder="예: 아티클"
									className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
								/>
								<button
									type="submit"
									className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 active:bg-indigo-700"
								>
									추가
								</button>
							</div>
							{error && (
								<p className="text-xs text-rose-500">{error}</p>
							)}
						</form>

						<div className="flex flex-col gap-2">
							<p className="text-xs font-medium text-slate-600">
								카테고리 순서
							</p>

							<ul className="max-h-72 space-y-2 overflow-y-auto">
								{newCategories.map((category, index) => {
									const isFirst = index === 0;
									const isLast =
										index === newCategories.length - 1;
									return (
										<li
											key={category}
											className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
										>
											<span className="text-sm text-slate-700">
												{category}
											</span>
											<div className="flex items-center gap-1.5">
												<button
													type="button"
													aria-label={`${category} 위로 이동`}
													onClick={() =>
														handleMoveCategory(
															category,
															-1,
														)
													}
													disabled={isFirst}
													className={[
														"flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors",
														isFirst
															? "cursor-not-allowed border-slate-100 text-slate-300"
															: "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700",
													].join(" ")}
												>
													<i className="ri-arrow-up-s-line" />
												</button>
												<button
													type="button"
													aria-label={`${category} 아래로 이동`}
													onClick={() =>
														handleMoveCategory(
															category,
															1,
														)
													}
													disabled={isLast}
													className={[
														"flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors",
														isLast
															? "cursor-not-allowed border-slate-100 text-slate-300"
															: "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700",
													].join(" ")}
												>
													<i className="ri-arrow-down-s-line" />
												</button>
												{category !== "기타" ? (
													<button
														type="button"
														aria-label={`${category} 삭제`}
														onClick={() =>
															handleDeleteClick(
																category,
															)
														}
														className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-100 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
													>
														<i className="ri-delete-bin-line" />
													</button>
												) : (
													<div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-100 text-slate-300 cursor-not-allowed">
														<i className="ri-delete-bin-line" />
													</div>
												)}
											</div>
										</li>
									);
								})}
							</ul>

							<p className="text-xs text-slate-400">
								삭제된 카테고리를 사용하던 북마크는 자동으로
								&quot;기타&quot;로 이동합니다.
							</p>
						</div>

						<div className="flex justify-end gap-2 pt-1">
							<button
								type="button"
								onClick={handleModalClose}
								className="rounded-lg px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100"
							>
								닫기
							</button>
							{isEdit && (
								<button
									type="submit"
									className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 transition-colors"
									onClick={handleSubmit}
								>
									적용
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* 삭제 확인 다이얼로그 */}
			{confirmOpen && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label="삭제 확인"
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
				>
					<div
						className="absolute inset-0 bg-black/40 backdrop-blur-sm"
						onClick={() => setConfirmOpen(false)}
					/>
					<div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden">
						{/* 아이콘 */}
						<div className="flex flex-col items-center px-6 pt-6 pb-4 text-center">
							<div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 text-2xl mb-3">
								<i className="ri-delete-bin-2-line" />
							</div>
							<h3 className="text-sm font-semibold text-slate-800 mb-1">
								카테고리를 삭제할까요?
							</h3>
							<p className="text-xs text-slate-400 leading-relaxed">
								<span className="font-medium text-slate-600">
									{deleteTarget}
								</span>{" "}
								이(가) 영구적으로 삭제됩니다.
							</p>
						</div>
						{/* 버튼 */}
						<div className="flex border-t border-slate-100">
							<button
								type="button"
								onClick={() => setConfirmOpen(false)}
								className="flex-1 py-3 text-sm text-slate-500 hover:bg-slate-50 transition-colors border-r border-slate-100"
							>
								취소
							</button>
							<button
								type="button"
								onClick={handleDeleteCategory}
								className="flex-1 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
							>
								삭제
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
