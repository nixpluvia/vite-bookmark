/**
 * 카테고리 필터 사이드바
 * @param {string[]} categories      - 전체 카테고리 목록
 * @param {string}   activeCategory  - 현재 선택된 카테고리
 * @param {object}   counts          - { [category]: number }
 * @param {function} onSelect        - (category: string) => void
 * @param {function} onOpenCategoryModal - 카테고리 관리 모달 열기
 */
export default function Sidebar({ categories, activeCategory, counts, onSelect, onOpenCategoryModal }) {
  return (
    <aside className="flex flex-col w-56 shrink-0 bg-white border-r border-slate-200 min-h-0">
      {/* 로고 영역 */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-100">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500 text-white text-base">
          <i className="ri-bookmark-3-fill" />
        </span>
        <span className="text-sm font-semibold text-slate-800 tracking-tight">Bookmark</span>
      </div>

      {/* 카테고리 목록 */}
      <nav className="flex flex-col gap-0.5 px-3 py-3 flex-1 overflow-y-auto">
        <p className="px-2 pt-1 pb-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
          카테고리
        </p>
        {categories.map((cat) => {
          const isActive = cat === activeCategory
          const count = counts?.[cat] ?? 0

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelect(cat)}
              className={[
                'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors text-left',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
            >
              <span className="flex items-center gap-2">
                <i className={`${CATEGORY_ICONS[cat] ?? 'ri-bookmark-line'} text-base`} />
                {cat}
              </span>
              {count > 0 && (
                <span
                  className={[
                    'text-xs rounded-full px-1.5 py-0.5 leading-none',
                    isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400',
                  ].join(' ')}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* 하단 힌트 */}
      <div className="px-5 py-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onOpenCategoryModal}
          className="mb-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <i className="ri-settings-3-line" />
          카테고리 관리
        </button>
        <p className="text-xs text-slate-400 leading-relaxed">
          <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-xs">Ctrl</kbd>
          {' + '}
          <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-xs">V</kbd>
          {' 로 URL 추가'}
        </p>
      </div>
    </aside>
  )
}

const CATEGORY_ICONS = {
  '전체': 'ri-apps-2-line',
  '개발': 'ri-code-s-slash-line',
  '디자인': 'ri-palette-line',
  '참고자료': 'ri-book-open-line',
  '영상': 'ri-play-circle-line',
  '기타': 'ri-more-line',
}
