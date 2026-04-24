import { useState, useEffect, useRef } from "react";
import useBookmarksStore from "../../store/useBookmarksStore";
import RatingStar from "../RatingStar";

const EMPTY_FORM = {
	url: "",
	thumbnail: "",
	title: "",
	description: "",
	category: "기타",
	rating: 0,
};

function createInitialForm({
	editTarget,
	initialUrl,
	activeCategory,
	initialImageUrl,
}) {
	if (editTarget) {
		return { ...EMPTY_FORM, ...editTarget };
	}

	return {
		...EMPTY_FORM,
		url: initialUrl ?? "",
		category: activeCategory !== "전체" ? activeCategory : "기타",
		thumbnail: initialImageUrl ?? "",
	};
}

/**
 * 북마크 추가/편집 모달
 */
export default function ModalBookmark({
	editTarget,
	initialUrl,
	initialImage,
	initialImageUrl,
    onClose,
	onSubmit,
	onDeleteThumbnail,
}) {
	const categories = useBookmarksStore((state) => state.categories).filter(
		(c) => c !== "전체",
	);
    const activeCategory = useBookmarksStore((state) => state.activeCategory);

	const [form, setForm] = useState(() =>
		createInitialForm({
			editTarget,
			initialUrl,
			activeCategory,
			initialImageUrl,
		}),
	);
	const urlInputRef = useRef(null);
	const patchForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

	useEffect(() => {
		requestAnimationFrame(() => urlInputRef.current?.focus());
	}, []);

	useEffect(() => {
		if (form.url !== initialUrl && initialUrl) {
			patchForm("url", initialUrl || "");
		}
		if (
			form.thumbnail === "" &&
			initialImageUrl &&
			initialImageUrl !== form.thumbnail
		) {
			patchForm("thumbnail", initialImageUrl);
		}
	}, [initialUrl, initialImageUrl]);

	const isEdit = Boolean(editTarget);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!form.url.trim()) return;
		onSubmit({ bookmark: form, imageFormData: initialImage });
	};

	return (
        <>
		{/* 폼 */}
        <form
            onSubmit={handleSubmit}
            className="px-6 py-5 flex flex-col gap-4"
        >
            {/* Thumbnail */}
            <div className="flex flex-col gap-1.5">
                <strong className="text-xs font-medium text-slate-600">
                    썸네일
                </strong>
                <div className="relative w-full h-40 flex items-center justify-center rounded-lg bg-slate-50 text-slate-300">
                    {form.thumbnail ? (
                        <>
                            <img
                                src={form.thumbnail}
                                alt="썸네일 미리보기"
                                className="w-full h-40 object-contain rounded-lg"
                            />
                            <button
                                type="button"
                                aria-label="닫기"
                                onClick={() => {
                                    patchForm("thumbnail", "");
                                    onDeleteThumbnail();
                                }}
                                className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <i className="ri-close-line text-lg" />
                            </button>
                        </>
                    ) : (
                        <i className="ri-image-line text-3xl" />
                    )}
                </div>
            </div>

            {/* URL */}
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="bm-url"
                    className="text-xs font-medium text-slate-600"
                >
                    URL <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                    <i className="ri-link absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                        ref={urlInputRef}
                        id="bm-url"
                        type="url"
                        required
                        value={form.url}
                        onChange={(e) =>
                            patchForm("url", e.target.value)
                        }
                        placeholder="https://example.com"
                        className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
                    />
                </div>
            </div>

            {/* 제목 */}
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="bm-title"
                    className="text-xs font-medium text-slate-600"
                >
                    제목
                </label>
                <input
                    id="bm-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => patchForm("title", e.target.value)}
                    placeholder="페이지 제목"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
                />
            </div>

            {/* 설명 */}
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="bm-desc"
                    className="text-xs font-medium text-slate-600"
                >
                    설명
                </label>
                <input
                    id="bm-desc"
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                        patchForm("description", e.target.value)
                    }
                    placeholder="한 줄 설명"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
                />
            </div>

            {/* 카테고리 + 별점 */}
            <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                    <label
                        htmlFor="bm-category"
                        className="text-xs font-medium text-slate-600"
                    >
                        카테고리
                    </label>
                    <select
                        id="bm-category"
                        value={form.category}
                        onChange={(e) =>
                            patchForm("category", e.target.value)
                        }
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
                    >
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-slate-600">
                        별점
                    </span>
                    <div className="flex items-center h-10">
                        <RatingStar
                            rating={form.rating}
                            onChange={(r) => {
                                if (r === form.rating) r = 0
                                patchForm("rating", r)
                            }}
                            size="text-xl"
                        />
                    </div>
                </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2 pt-1">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    취소
                </button>
                <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 transition-colors"
                >
                    {isEdit ? "저장" : "추가"}
                </button>
            </div>
        </form>
        </>
	);
}
