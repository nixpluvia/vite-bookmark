import { useCallback, useEffect, useRef, useState } from "react";
import useStore from "../../store/useStore";
import useBookmarksStore from "../../store/useBookmarksStore";
import { set } from "date-fns";

/**
 * 카테고리 관리 모달
 */
export default function ModalCategory({
	onClose,
	tempCategories,
	onChangeCategories,
	isEditing,
	onEditing,
	onChangeDeleteTarget,
	onDeleteCategory,
}) {
	const categories = useBookmarksStore((state) => state.categories);
	const activeCategory = useStore((state) => state.activeCategory);
	const setActiveCategory = useStore((state) => state.actions.setActiveCategory);
	const updateCategories = useBookmarksStore((state) => state.actions.updateCategories);

	const [editTarget, setEditTarget] = useState(null);
	const [newCategory, setNewCategory] = useState("");
	const [error, setError] = useState("");
	const inputRef = useRef(null);

	useEffect(() => {
		requestAnimationFrame(() => inputRef.current?.focus());

		return () => {
			onChangeDeleteTarget();
			onEditing(false);
		}
	}, []);

	const handleAdd = (e) => {
		e.preventDefault();
		const name = newCategory.trim();
		if (!name) {
			setError("카테고리 이름을 입력해주세요.");
			return;
		}
		if (tempCategories.includes(name) || name === "전체") {
			setError("이미 존재하는 카테고리입니다.");
			return;
		}
		onChangeCategories((prev) => [...prev, name]);
		setNewCategory("");
		onEditing(true);
		inputRef.current?.focus();
	};

	const handleRename = (e) => {
		e.preventDefault();
		const name = newCategory.trim();
		if (!name) {
			setError("카테고리 이름을 입력해주세요.");
			return;
		}
		if (tempCategories.includes(name) || name === "전체") {
			setError("이미 존재하는 카테고리입니다.");
			return;
		}
		const categoryIndex = tempCategories.findIndex((c) => c === editTarget);
		if (categoryIndex === -1) return;
		const newCategories = [...tempCategories];
		newCategories[categoryIndex] = name;
		
		onChangeCategories(newCategories);
		setNewCategory("");
		setEditTarget(null);
		onEditing(true);
		inputRef.current?.focus();
	}

	const handleMoveCategory = useCallback((name, direction) => {
		if (name === "전체" || direction === 0) return;

		const list = [...tempCategories];
		const index = list.indexOf(name);
		if (index === -1) return;

		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= list.length) return;

		[list[index], list[targetIndex]] = [list[targetIndex], list[index]];
		onChangeCategories(list);
		onEditing(true);
	}, [tempCategories, onEditing, onChangeCategories]);


	const handleUpdateCategories = useCallback((newCategories) => {
		updateCategories(newCategories);
		if (!newCategories.includes(activeCategory)) {
			setActiveCategory("전체");
		}
	}, [activeCategory, updateCategories, setActiveCategory]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!isEditing) return;

		handleUpdateCategories(tempCategories);
		onClose();
	};

	return (
		<>
			<div className="flex flex-col gap-5 px-6 py-5">
				{editTarget ? (
					<form
						onSubmit={handleRename}
						className="flex flex-col gap-2"
					>
						<label
							htmlFor="edit-category"
							className="text-xs font-medium text-slate-600"
						>
							카테고리 이름 변경
						</label>
						<div className="flex gap-2">
							<input
								ref={inputRef}
								id="edit-category"
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
								type="button"
								className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600 active:bg-gray-700"
								onClick={(e) => {
									e.preventDefault();
									setEditTarget(null);
									setNewCategory("");
									setError("");
								}}
							>
								취소
							</button>
							<button
								type="submit"
								className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 active:bg-indigo-700"
							>
								변경
							</button>
						</div>
						{error && (
							<p className="text-xs text-rose-500">{error}</p>
						)}
					</form>
				) : (
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
				)}

				<div className="flex flex-col gap-2">
					<p className="text-xs font-medium text-slate-600">
						카테고리 순서
					</p>

					<ul className="max-h-72 space-y-2 overflow-y-auto">
						{tempCategories.map((category, index) => {
							const isFirst = index === 0;
							const isLast =
								index === tempCategories.length - 1;
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
												aria-label={`${category} 이름 변경`}
												onClick={() => {
													if (editTarget === category) {
														setEditTarget(null);
														setNewCategory("");
														setError("");
														return;
													}
													setEditTarget(category);
													setNewCategory(category);
												}}
												className={[
													"flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-500",
													editTarget === category ? "border-indigo-700 bg-indigo-500 text-white hover:border-indigo-800 hover:bg-indigo-600 hover:text-white" : "",
												].join(" ")}
											>
												<i className="ri-pencil-line" />
											</button>
										) : (
											<div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-100 text-slate-300 cursor-not-allowed">
												<i className="ri-pencil-line" />
											</div>
										)}
										{category !== "기타" && editTarget === null ? (
											<button
												type="button"
												aria-label={`${category} 삭제`}
												onClick={() =>
													onDeleteCategory(category)
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
						onClick={onClose}
						className="rounded-lg px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100"
					>
						닫기
					</button>
					{isEditing && (
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
		</>
	);
}
