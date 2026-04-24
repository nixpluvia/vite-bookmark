import useStore from "../../store/useStore";
import useBookmarksStore from "../../store/useBookmarksStore";
import BookmarkUtils from "./BookmarkUtils";
import BookmarkList from "./BookmarkList";

export default function Bookmark({
    onEditBookmark,
    onAddBookmark,
    onOpenImageModal,
}) {
    const bookmarks = useBookmarksStore((state) => state.bookmarks);

    // 필터 / 검색
	const activeCategory = useStore((state) => state.activeCategory);
	const searchQuery = useStore((state) => state.searchQuery);
	const ratingFilter = useStore((state) => state.ratingFilter);
	const dateFrom = useStore((state) => state.dateFrom);
	const dateTo = useStore((state) => state.dateTo);
	const sort = useStore((state) => state.sort);
    

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
        <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
                <BookmarkUtils
                    filteredNum={filtered.length}
                />
                <BookmarkList
                    filteredBookmarks={filtered}
                    onEditBookmark={onEditBookmark}
                    onAddBookmark={onAddBookmark}
                    onOpenImageModal={onOpenImageModal}
                />
            </div>
        </>
    )
}