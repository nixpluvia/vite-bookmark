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
import { useStore, isFiltered } from "../../store/useStore";
import useBookmarksStore from "../../store/useBookmarksStore";
import { shallow } from "zustand/shallow";
import BookmarkCard from "./BookmarkCard";
import Confirm from "../Confirm";

/**
 * 북마크 리스트 컴포넌트
 * @param {object}   bookmark   - 북마크 데이터
 */
export default function BookmarkList({
	filteredBookmarks,
	onEditBookmark,
	onAddBookmark,
	onOpenImageModal,
}) {
	const ableSortCard = useStore((state) => state.ableSortCard);
	const hasFilter = useStore(isFiltered, shallow);
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
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id && active.rating === over.rating);
				if (oldIndex === -1 || newIndex === -1) return; // 인덱스가 유효한지 확인

				// arrayMove는 dnd-kit에서 제공하는 순서 교체 유틸리티 함수입니다.
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	return (
		<>
			{listData.length === 0 ? (
				<EmptyState hasBookmarks={bookmarks.length > 0} onAddBookmark={onAddBookmark} />
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
									bookmark={bookmark}
									onDelete={(bookmark) => {
										setTargetBookmark(bookmark);
										setConfirmOpen(true);
									}}
									onEditBookmark={onEditBookmark}
									onOpenImageModal={onOpenImageModal}
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
			<Confirm
				isOpen={confirmOpen}
				type={"delete"}
				title={"북마크 삭제"}
				message={"북마크를 삭제할까요?"}
				target={targetBookmark?.title || targetBookmark?.url}
				onCancel={() => setConfirmOpen(false)}
				onConfirm={() => {
					setConfirmOpen(false);
					deleteBookmark(targetBookmark?.id);
				}}
			/>
		</>
	);
}

function EmptyState({ hasBookmarks, onAddBookmark }) {
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
					onClick={onAddBookmark}
					className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600 transition-colors"
				>
					첫 북마크 추가
				</button>
			)}
		</div>
	);
}
