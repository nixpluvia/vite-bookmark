import { useState, useCallback, useMemo, useEffect } from "react";
// import { useBookmarks } from "./hooks/useBookmarks";
import useBookmarksStore from "./store/useBookmarksStore";
import { useClipboard } from "./hooks/useClipboard";
import Sidebar from "./components/Sidebar";
import GlobalSearchBar from "./components/GlobalSearchBar";
import BookmarkUtils from "./components/BookmarkUtils";
import BookmarkList from "./components/BookmarkList";
import Modal from "./components/Modal";
import ModalCategory from "./components/ModalCategory";
import ModalImage from "./components/ModalImage";

export default function App() {
	const initData = useBookmarksStore((state) => state.actions.initData);
	const bookmarks = useBookmarksStore((state) => state.bookmarks);
	const categories = useBookmarksStore((state) => state.categories);
	const addBookmark = useBookmarksStore((state) => state.actions.addBookmark);
	const editBookmark = useBookmarksStore((state) => state.actions.editBookmark);
	const deleteBookmark = useBookmarksStore((state) => state.actions.deleteBookmark);
	const updateCategories = useBookmarksStore((state) => state.actions.updateCategories);

	// 모달 상태
	const [modalOpen, setModalOpen] = useState(false);
	const [categoryModalOpen, setCategoryModalOpen] = useState(false);
	const [pendingUrl, setPendingUrl] = useState("");
	const [editTarget, setEditTarget] = useState(null);
	const [pendingImage, setPendingImage] = useState(null);
	const [pendingImageUrl, setPendingImageUrl] = useState(null);
	const [modalSession, setModalSession] = useState(0);
	const [categoryModalSession, setCategoryModalSession] = useState(0);
	const [modalImageOpen, setModalImageOpen] = useState(false);
	const [modalImageUrl, setModalImageUrl] = useState(null);

	// 필터 / 검색
	const [activeCategory, setActiveCategory] = useState("전체");
	const [searchQuery, setSearchQuery] = useState("");
	const [ratingFilter, setRatingFilter] = useState(0); // 0 = 전체
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");

	const [cardTemplate, setCardTemplate] = useState("default");
	const [sort, setSort] = useState({
		type: null, // createdAt, title
		order: null,
	})
	const [ableSortCard, setAbleSortCard] = useState(false);

	useEffect(() => {
		initData();
	}, [initData]);
	


	const handleChangeTemplate = useCallback((template) => {
		setCardTemplate(template);
	}, []);

	const handleToggleSortCard = useCallback(() => {
		setAbleSortCard((prev) => !prev);
	}, []);

	const hasFilter =
		searchQuery.trim() !== "" ||
		ratingFilter > 0 ||
		dateFrom !== "" ||
		dateTo !== "" ||
		sort.type !== null;

	const resetFilter = useCallback(() => {
		setSearchQuery("");
		setRatingFilter(0);
		setDateFrom("");
		setDateTo("");
	}, []);

	const clearPendingImageState = useCallback(() => {
		setPendingImage(null);
		setPendingImageUrl((prevUrl) => {
			if (prevUrl) {
				URL.revokeObjectURL(prevUrl);
			}
			return null;
		});
	}, []);

	// Ctrl+V → URL 감지 → 모달 오픈
	const handleUrlDetected = useCallback((data) => {
		if (!modalOpen) {
			setModalSession((prev) => prev + 1);
		}
		if (data.type === "text") {
			setPendingUrl(data.url);
		} else if (data.type === "image") {
			setPendingImage(data.formData);
			setPendingImageUrl(data.url);
		}
		setModalOpen(true);
	}, [modalOpen]);
	useClipboard(handleUrlDetected);

	// 편집 모달 오픈
	const openEditModal = useCallback((bookmark) => {
		setModalSession((prev) => prev + 1);
		setEditTarget(bookmark);
		setPendingUrl("");
		clearPendingImageState();
		setModalOpen(true);
	}, [clearPendingImageState]);

	const handleCloseModal = useCallback(() => {
		setModalOpen(false);
		setEditTarget(null);
		setPendingUrl("");
		clearPendingImageState();
	}, [clearPendingImageState]);

	const handleModalSubmit = useCallback(
		({ bookmark, imageFormData }) => {
			if (editTarget) {
				editBookmark(editTarget.id, bookmark, imageFormData);
			} else {
				addBookmark(bookmark, imageFormData);
			}
			handleCloseModal();
		},
		[editTarget, addBookmark, editBookmark, handleCloseModal],
	);

	const handleOpenAddBookmark = useCallback(() => {
		setModalSession((prev) => prev + 1);
		setEditTarget(null);
		setPendingUrl("");
		clearPendingImageState();
		setModalOpen(true);
	}, [clearPendingImageState]);

	const handleOpenCategoryModal = useCallback(() => {
		setCategoryModalSession((prev) => prev + 1);
		setCategoryModalOpen(true);
	}, []);

	const handleCloseCategoryModal = useCallback(() => {
		setCategoryModalOpen(false);
	}, []);

	const handleUpdateCategories = useCallback(
		(newCategories) => {
			updateCategories(newCategories);
			if (!newCategories.includes(activeCategory)) {
				setActiveCategory("전체");
			}
		},
		[activeCategory, updateCategories],
	);

	const handleDeletePendingThumbnail = useCallback(
		() => {
			clearPendingImageState();
		},
		[clearPendingImageState],
	);

	const handleOpenModalImage = useCallback((imageUrl) => {
		setModalImageUrl(imageUrl);
		setModalImageOpen(true);
	}, []);

	const handleCloseModalImage = useCallback(() => {
		setModalImageUrl(null);
		setModalImageOpen(false);
	}, []);

	const handleSortChange = useCallback((type) => {
		if (type == null) {
			setSort({ type: null, order: null });
			return;
		}
		setSort((prev) => ({
			type,
			order: prev.type === type && prev.order === "asc" ? "desc" : "asc",
		}));
	}, []);


	// 카테고리별 카운트
	const counts = useMemo(() => {
		const map = { 전체: bookmarks.length };
		bookmarks.forEach((b) => {
			map[b.category] = (map[b.category] ?? 0) + 1;
		});
		return map;
	}, [bookmarks]);

	// 필터링
	const filtered = useMemo(() => {
		if (bookmarks.length === 0) return [];
		let list =
			activeCategory === "전체"
				? bookmarks
				: bookmarks.filter((b) => b.category === activeCategory);
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(b) =>
					b.title?.toLowerCase().includes(q) ||
					b.url?.toLowerCase().includes(q) ||
					b.description?.toLowerCase().includes(q) ||
					b.memo?.toLowerCase().includes(q),
			);
		}
		if (ratingFilter > 0) {
			list = list.filter((b) => b.rating >= ratingFilter);
		}
		if (dateFrom) {
			const from = new Date(dateFrom);
			from.setHours(0, 0, 0, 0);
			list = list.filter((b) => new Date(b.createdAt) >= from);
		}
		if (dateTo) {
			const to = new Date(dateTo);
			to.setHours(23, 59, 59, 999);
			list = list.filter((b) => new Date(b.createdAt) <= to);
		}
		if (sort.type === "createdAt") {
			list = [...list].sort((a, b) =>
				sort.order === "asc"
					? new Date(a.createdAt) - new Date(b.createdAt)
					: new Date(b.createdAt) - new Date(a.createdAt),
			);
		} else if (sort.type === "title") {
			list = [...list].sort((a, b) => {
				const titleA = a.title?.toLowerCase() ?? "";
				const titleB = b.title?.toLowerCase() ?? "";
				if (titleA < titleB) return sort.order === "asc" ? -1 : 1;
				if (titleA > titleB) return sort.order === "asc" ? 1 : -1;
				return 0;
			});
		}
		// 최종적으로 별점순으로 정렬
		list = list.sort((a, b) => b.rating - a.rating);
		return list;
	}, [
		bookmarks,
		activeCategory,
		searchQuery,
		ratingFilter,
		dateFrom,
		dateTo,
		sort,
	]);

	return (
		<div className="flex h-screen overflow-hidden bg-slate-50">
			{/* 사이드바 */}
			<Sidebar
				categories={categories}
				activeCategory={activeCategory}
				counts={counts}
				onSelect={setActiveCategory}
				onOpenCategoryModal={handleOpenCategoryModal}
			/>

			{/* 메인 콘텐츠 */}
			<main className="flex flex-col flex-1 min-w-0 overflow-hidden">
				{/* 상단 헤더 */}
				<GlobalSearchBar
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					ratingFilter={ratingFilter}
					setRatingFilter={setRatingFilter}
					dateFrom={dateFrom}
					setDateFrom={setDateFrom}
					dateTo={dateTo}
					setDateTo={setDateTo}
					resetFilter={resetFilter}
					hasFilter={hasFilter}
					handleOpenAddBookmark={handleOpenAddBookmark}
				/>

				{/* 북마크 그리드 */}
				<div className="flex-1 overflow-y-auto px-6 py-5">
					<BookmarkUtils
						filteredBookmarks={filtered}
						cardTemplate={cardTemplate}
						onChangeTemplate={handleChangeTemplate}
						hasFilter={hasFilter}
						onToggleSortCard={handleToggleSortCard}
						ableSortCard={ableSortCard}
						onChangeSort={handleSortChange}
						sort={sort}
					/>
					<BookmarkList
						filteredBookmarks={filtered}
						hasFilter={hasFilter}
						onEdit={openEditModal}
						onAdd={handleOpenAddBookmark}
						onOpenModalImage={handleOpenModalImage}
						cardTemplate={cardTemplate}
						ableSortCard={ableSortCard}
					/>
				</div>
			</main>

			{/* 모달 */}
			<Modal
				key={modalSession}
				isOpen={modalOpen}
				initialUrl={pendingUrl}
				initialImage={pendingImage}
				initialImageUrl={pendingImageUrl}
				editTarget={editTarget}
				activeCategory={activeCategory}
				categories={categories}
				onSubmit={handleModalSubmit}
				onClose={handleCloseModal}
				onDeleteThumbnail={handleDeletePendingThumbnail}
			/>

			<ModalCategory
				key={categoryModalSession}
				isOpen={categoryModalOpen}
				categories={categories}
				onUpdateCategories={handleUpdateCategories}
				onClose={handleCloseCategoryModal}
			/>

			<ModalImage
				isOpen={modalImageOpen}
				imageUrl={modalImageUrl}
				onClose={handleCloseModalImage}
			/>
		</div>
	);
}
