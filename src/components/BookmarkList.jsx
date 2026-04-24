import { useState, useMemo } from "react";
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	rectSortingStrategy,
} from "@dnd-kit/sortable";
import BookmarkCard from "./BookmarkCard";
import useBookmarksStore from "../store/useBookmarksStore";

/**
 * 북마크 리스트 컴포넌트
 * @param {object}   bookmark   - 북마크 데이터
 */
export default function BookmarkList({
	filteredBookmarks,
	hasFilter,
	onEdit,
	onAdd,
	onOpenModalImage,
  cardTemplate,
  ableSortCard,
}) {
	const bookmarks = useBookmarksStore((state) => state.bookmarks);
	const updateBookmark = useBookmarksStore((state) => state.actions.updateBookmark);
	const deleteBookmark = useBookmarksStore((state) => state.actions.deleteBookmark);
	const [targetBookmark, setTargetBookmark] = useState(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const listData = useMemo(() => {
		if (hasFilter) {
			return filteredBookmarks;
		}
		return bookmarks;
	}, [hasFilter, filteredBookmarks, bookmarks]);

	// 드래그 설정
	const sensors = useSensors(useSensor(PointerSensor));

	const handleDragEnd = (event) => {
		const { active, over } = event;

		if (active.id !== over.id) {
			updateBookmark((items) => {
				const oldIndex = items.findIndex(
					(item) => item.id === active.id,
				);
				const newIndex = items.findIndex((item) => item.id === over.id);

				// arrayMove는 dnd-kit에서 제공하는 순서 교체 유틸리티 함수입니다.
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	return (
		<>
			{listData.length === 0 ? (
				<EmptyState hasBookmarks={bookmarks.length > 0} onAdd={onAdd} />
			) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter} // 중심점을 기준으로 충돌 감지
          onDragEnd={handleDragEnd}
        >
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 list-none p-0 m-0">
            <SortableContext
              items={listData}
              strategy={rectSortingStrategy}
            >
              {listData.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  id={bookmark.id}
                  cardTemplate={cardTemplate}
                  bookmark={bookmark}
                  onDelete={() => {
                    setTargetBookmark(bookmark);
                    setConfirmOpen(true);
                  }}
                  onEdit={onEdit}
                  onOpenModalImage={onOpenModalImage}
                  isDragDisabled={
                    hasFilter || ableSortCard === false
                  }
                />
              ))}
            </SortableContext>
          </ul>
        </DndContext>
			)}

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
								북마크를 삭제할까요?
							</h3>
							<p className="text-xs text-slate-400 leading-relaxed">
								<span className="font-medium text-slate-600">
									{targetBookmark.title || targetBookmark.url}
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
								onClick={() => {
									setConfirmOpen(false);
									deleteBookmark(targetBookmark.id);
								}}
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

function EmptyState({ hasBookmarks, onAdd }) {
	return (
		<div className="flex flex-col items-center justify-center h-full min-h-64 text-center">
			<div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-400 text-3xl mb-4">
				<i
					className={
						hasBookmarks
							? "ri-filter-off-line"
							: "ri-bookmark-3-line"
					}
				/>
			</div>
			<p className="text-sm font-medium text-slate-600 mb-1">
				{hasBookmarks
					? "검색 결과가 없습니다"
					: "저장된 북마크가 없습니다"}
			</p>
			<p className="text-xs text-slate-400 mb-4">
				{hasBookmarks
					? "다른 검색어나 카테고리를 선택해보세요."
					: "Ctrl+V 로 URL을 붙여넣거나 추가 버튼을 눌러보세요."}
			</p>
			{!hasBookmarks && (
				<button
					type="button"
					onClick={onAdd}
					className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600 transition-colors"
				>
					첫 북마크 추가
				</button>
			)}
		</div>
	);
}
