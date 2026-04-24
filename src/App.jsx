import { useState, useCallback, useMemo, useEffect, use } from "react";
// import { useBookmarks } from "./hooks/useBookmarks";
import useStore from "./store/useStore";
import useBookmarksStore from "./store/useBookmarksStore";
import { useClipboard } from "./hooks/useClipboard";
import Sidebar from "./components/Sidebar";
import GlobalSearchBar from "./components/GlobalSearchBar";
import BookmarkContent from "./components/bookmark/index";
import Modal from "./components/modal/Index";
import ModalBookmark from "./components/modal/ModalBookmark";
import ModalCategory from "./components/modal/ModalCategory";
import ModalImage from "./components/modal/ModalImage";
import Confirm from "./components/Confirm";
import { ca } from "date-fns/locale";
import { set } from "date-fns";

export default function App() {
	const isInitialized = useBookmarksStore((state) => state.isInitialized);
	const initData = useBookmarksStore((state) => state.actions.initData);
	const bookmarks = useBookmarksStore((state) => state.bookmarks);
	const categories = useBookmarksStore((state) => state.categories);
	const addBookmark = useBookmarksStore((state) => state.actions.addBookmark);
	const editBookmark = useBookmarksStore((state) => state.actions.editBookmark);

	// clipboard
	const [pendingUrl, setPendingUrl] = useState("");
	const [pendingImage, setPendingImage] = useState(null);
	const [pendingImageUrl, setPendingImageUrl] = useState(null);

	// 모달 상태
	const [modalOpen, setModalOpen] = useState(false);
	const [categoryModalOpen, setCategoryModalOpen] = useState(false);
	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [modalSession, setModalSession] = useState(0);
	const [categoryModalSession, setCategoryModalSession] = useState(0);
	const [editTarget, setEditTarget] = useState(null);
	const [modalImageUrl, setModalImageUrl] = useState(null);

	// 필터 / 검색
	const activeCategory = useStore((state) => state.activeCategory);

	// 카테고리 관리
	const [tempCategories, setTempCategories] = useState(categories);
	const [categoryTarget, setCategoryTarget] = useState(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [isCategoryEditing, setIsCategoryEditing] = useState(false);

	useEffect(() => {
		if (!isInitialized) initData();
	}, [initData, isInitialized]);

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


	// 북마크 모달 ------
	const handleOpenAddBookmark = useCallback(() => {
		setModalSession((prev) => prev + 1);
		setEditTarget(null);
		setPendingUrl("");
		clearPendingImageState();
		setModalOpen(true);
	}, [clearPendingImageState]);

	const handleOpenEditBookmark = useCallback((bookmark) => {
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

	const handleDeletePendingThumbnail = useCallback(
		() => {
			clearPendingImageState();
		},
		[clearPendingImageState],
	);


	// 카테고리 모달 ------
	const handleOpenCategoryModal = useCallback(() => {
		setCategoryModalSession((prev) => prev + 1);
		setTempCategories(categories);
		setCategoryModalOpen(true);
	}, [categories]);

	const handleCloseCategoryModal = useCallback(() => {
		setTempCategories(null);
		setCategoryModalOpen(false);
	}, []);
	
	const handleChangeCategoryTarget = useCallback((category) => {
		setCategoryTarget(category);
	}, []);

	const handleDeleteCategory = (category) => {
		if (category === "기타") {
			alert("기타 카테고리는 삭제할 수 없습니다.");
			return;
		}
		setCategoryTarget(category);
		setConfirmOpen(true);
	};

	const handleConfirmDeleteCategory = useCallback(() => {
		if (!categoryTarget) return;

		const changeCategories = [...tempCategories];
		const targetIndex = changeCategories.indexOf(categoryTarget);
		if (targetIndex < 0) return;
		changeCategories.splice(targetIndex, 1);
		setTempCategories(changeCategories);
		setCategoryTarget(null);
		setIsCategoryEditing(true);
		setConfirmOpen(false);
	}, [categoryTarget]);

	
	// 이미지 자세히보기 모달 ------
	const handleOpenImageModal = useCallback((imageUrl) => {
		setModalImageUrl(imageUrl);
		setImageModalOpen(true);
	}, []);

	const handleCloseImageModal = useCallback(() => {
		setModalImageUrl(null);
		setImageModalOpen(false);
	}, []);


	return (
		<div className="flex h-screen overflow-hidden bg-slate-50">
			{/* 사이드바 */}
			<Sidebar
				onOpenCategoryModal={handleOpenCategoryModal}
			/>

			{/* 메인 콘텐츠 */}
			<main className="flex flex-col flex-1 min-w-0 overflow-hidden">
				{/* 상단 헤더 */}
				<GlobalSearchBar
					handleOpenAddBookmark={handleOpenAddBookmark}
				/>

				{/* 북마크 그리드 */}
				<BookmarkContent
					onAddBookmark={handleOpenAddBookmark}
					onEditBookmark={handleOpenEditBookmark}
					onOpenImageModal={handleOpenImageModal}
				/>
			</main>

			{/* 모달 */}
			<Modal
				key={'m' + modalSession}
				title={editTarget ? "북마크 편집" : "북마크 추가"}
				isOpen={modalOpen}
				onClose={handleCloseModal}
			>	
				<ModalBookmark
					isOpen={modalOpen}
					initialUrl={pendingUrl}
					initialImage={pendingImage}
					initialImageUrl={pendingImageUrl}
					editTarget={editTarget}
					activeCategory={activeCategory}
					onClose={handleCloseModal}
					onSubmit={handleModalSubmit}
					onDeleteThumbnail={handleDeletePendingThumbnail}
				/>
			</Modal>

			<Modal
				key={'mc' + categoryModalSession}
				title={"카테고리 관리"}
				isOpen={categoryModalOpen}
				onClose={handleCloseCategoryModal}
			>	
				<ModalCategory
					onClose={handleCloseCategoryModal}
					tempCategories={tempCategories}
					onChangeCategories={setTempCategories}
					isEditing={isCategoryEditing}
					onEditing={setIsCategoryEditing}
					onChangeDeleteTarget={handleChangeCategoryTarget}
					onDeleteCategory={handleDeleteCategory}
				/>
			</Modal>

			<Modal
				size="xl"
				title={"이미지 자세히보기"}
				isOpen={imageModalOpen}
				onClose={handleCloseImageModal}
			>
				<ModalImage
					isOpen={imageModalOpen}
					imageUrl={modalImageUrl}
					onClose={handleCloseImageModal}
				/>
			</Modal>

			<Confirm
				isOpen={confirmOpen}
				type={"delete"}
				title={"카테고리 삭제"}
				message={"카테고리를 삭제할까요?"}
				target={categoryTarget}
				onCancel={() => setConfirmOpen(false)}
				onConfirm={handleConfirmDeleteCategory}
			/>

		</div>
	);
}
