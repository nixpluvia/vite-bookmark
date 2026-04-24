import { useState, useMemo } from "react";

/**
 * 북마크 유틸 컴포넌트
 */
export default function BookmarkList({ filteredBookmarks, cardTemplate, onChangeTemplate, hasFilter, onToggleSortCard, ableSortCard, onChangeSort, sort }) {
	return (
		<>
			{/* 상단 정보 및 템플릿 선택 */}
			<div className="flex mb-4 items-center justify-between mb-5">
				<div className="flex items-center gap-3">
					<p className="text-xs text-slate-400">
						{hasFilter && (
							<span className="inline-flex items-center gap-1 text-indigo-500 font-medium mr-2">
								<i className="ri-filter-3-line" />
								필터 적용 중
							</span>
						)}
						총
						<span className="px-0.5 font-medium text-slate-600">
							{filteredBookmarks.length}
						</span>
						개
					</p>

					<div className="flex items-center gap-1">
						<p className="text-xs text-slate-600">정렬</p>
						<div className="flex items-center gap-1">
							<button
								type="button"
								className={
									["inline-flex items-center gap-1 text-xs",
									sort.type === "createdAt"
										? "text-indigo-500 font-medium"
										: "text-slate-400 hover:text-slate-700",
									].join(" ")
								}
								onClick={() => onChangeSort("createdAt")}
							>
								최신순
								{sort.type === "createdAt" && sort.order === "desc" && (
									<i className="ri-arrow-down-s-line text-base text-indigo-500"></i>
								)}
								{sort.type === "createdAt" && sort.order === "asc" && (
									<i className="ri-arrow-up-s-line text-base text-indigo-500"></i>
								)}
							</button>
							<button
								type="button"
								className={
									["inline-flex items-center gap-1 text-xs",
									sort.type === "title"
										? "text-indigo-500 font-medium"
										: "text-slate-400 hover:text-slate-700",
									].join(" ")
								}
								onClick={() => onChangeSort("title")}
							>
								가나다순
								{sort.type === "title" && sort.order === "desc" && (
									<i className="ri-arrow-down-s-line text-base text-indigo-500"></i>
								)}
								{sort.type === "title" && sort.order === "asc" && (
									<i className="ri-arrow-up-s-line text-base text-indigo-500"></i>
								)}
							</button>
						</div>
						<button
							type="button"
							onClick={() => onChangeSort(null)}
						>
							<i className="ri-refresh-line text-base"></i>
						</button>
					</div>
				</div>

				<div className="flex ml-auto items-center gap-2">
					{!hasFilter ? (
						<button
							type="button"
							className={[
								"flex items-center gap-1.5 px-2 py-1 rounded-lg text-white text-sm font-medium transition-colors",
								ableSortCard
									? "bg-rose-500 hover:bg-rose-600 active:bg-rose-700"
									: "bg-slate-500 hover:bg-slate-600 active:bg-slate-700",
							].join(" ")}
							onClick={onToggleSortCard}
						>
							<i className="ri-drag-drop-line text-base"></i>순서
							편집
						</button>
					) : null}
					<div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
						<button
							type="button"
							aria-label="기본 목록 스타일"
							aria-pressed={cardTemplate === "default"}
							onClick={() => {
								onChangeTemplate("default");
							}}
							className={[
								"inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
								cardTemplate === "default"
									? "bg-indigo-500 text-white"
									: "text-slate-600 hover:bg-slate-100",
							].join(" ")}
						>
							<i className="ri-layout-grid-line text-sm" />
							기본
						</button>
						<button
							type="button"
							aria-label="썸네일 목록 스타일"
							aria-pressed={cardTemplate === "thumbnail"}
							onClick={() => {
								onChangeTemplate("thumbnail");
							}}
							className={[
								"inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
								cardTemplate === "thumbnail"
									? "bg-indigo-500 text-white"
									: "text-slate-600 hover:bg-slate-100",
							].join(" ")}
						>
							<i className="ri-image-2-line text-sm" />
							썸네일
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
