import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, parseISO, isValid } from "date-fns";
import "react-day-picker/style.css";

export default function GlobalSearchBar({ 
    searchQuery,
    setSearchQuery,
    ratingFilter,
    setRatingFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    resetFilter,
    hasFilter,
    handleOpenAddBookmark
 }) {
    const [openPicker, setOpenPicker] = useState(null);

    const fromDateValue = useMemo(() => {
      if (!dateFrom) return undefined;
      const parsed = parseISO(dateFrom);
      return isValid(parsed) ? parsed : undefined;
    }, [dateFrom]);

    const toDateValue = useMemo(() => {
      if (!dateTo) return undefined;
      const parsed = parseISO(dateTo);
      return isValid(parsed) ? parsed : undefined;
    }, [dateTo]);

    const handleSelectFrom = (selected) => {
      if (!selected) {
        setDateFrom("");
        setOpenPicker(null);
        return;
      }

      const nextFrom = format(selected, "yyyy-MM-dd");
      setDateFrom(nextFrom);
      if (dateTo && nextFrom > dateTo) {
        setDateTo(nextFrom);
      }
      setOpenPicker(null);
    };

    const handleSelectTo = (selected) => {
      if (!selected) {
        setDateTo("");
        setOpenPicker(null);
        return;
      }

      const nextTo = format(selected, "yyyy-MM-dd");
      setDateTo(nextTo);
      if (dateFrom && nextTo < dateFrom) {
        setDateFrom(nextTo);
      }
      setOpenPicker(null);
    };

    return (
        <header className="flex flex-col gap-3 px-6 py-4 bg-white border-b border-slate-200 shrink-0">
          {/* 필터 행 */}
          <div className="flex items-center gap-3">
            {/* 날짜 범위 */}
            <div className="flex items-center gap-1.5 shrink-0 relative">
              <i className="ri-calendar-line text-slate-400 text-sm shrink-0" />
              <div className="relative">
                <button
                  type="button"
                  aria-label="시작일 선택"
                  onClick={() =>
                    setOpenPicker(openPicker === "from" ? null : "from")
                  }
                  className="w-36 px-2.5 py-2 rounded-lg border border-slate-200 text-sm text-left text-slate-700 bg-slate-50 outline-none hover:bg-white focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                >
                  {dateFrom || "시작일"}
                </button>
                {openPicker === "from" && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-30 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <DayPicker
                      mode="single"
                      selected={fromDateValue}
                      onSelect={handleSelectFrom}
                      defaultMonth={fromDateValue || new Date()}
                      disabled={toDateValue ? { after: toDateValue } : undefined}
                      captionLayout="dropdown"
                    />
                  </div>
                )}
              </div>

              <span className="text-slate-300 text-sm select-none">~</span>

              <div className="relative">
                <button
                  type="button"
                  aria-label="종료일 선택"
                  onClick={() =>
                    setOpenPicker(openPicker === "to" ? null : "to")
                  }
                  className="w-36 px-2.5 py-2 rounded-lg border border-slate-200 text-sm text-left text-slate-700 bg-slate-50 outline-none hover:bg-white focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                >
                  {dateTo || "종료일"}
                </button>
                {openPicker === "to" && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-30 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <DayPicker
                      mode="single"
                      selected={toDateValue}
                      onSelect={handleSelectTo}
                      defaultMonth={toDateValue || fromDateValue || new Date()}
                      disabled={fromDateValue ? { before: fromDateValue } : undefined}
                      captionLayout="dropdown"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 구분선 */}
            <div className="w-px h-5 bg-slate-200 shrink-0" />

            {/* 별점 필터 */}
            <div className="flex items-center gap-0.5 shrink-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star}점 이상 필터`}
                  onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}
                  className={[
                    'text-xl leading-none transition-all cursor-pointer hover:scale-110',
                    star <= ratingFilter ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300',
                  ].join(' ')}
                  style={{ background: 'none', border: 'none', padding: '1px' }}
                >
                  <i className={star <= ratingFilter ? 'ri-star-fill' : 'ri-star-line'} />
                </button>
              ))}
            </div>

            {/* 구분선 */}
            <div className="w-px h-5 bg-slate-200 shrink-0" />

            {/* 검색창 */}
            <div className="relative flex-1">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            {/* 초기화 버튼 */}
            <button
              type="button"
              aria-label="필터 초기화"
              onClick={resetFilter}
              disabled={!hasFilter}
              className={[
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors shrink-0',
                hasFilter
                  ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                  : 'text-slate-300 bg-slate-50 cursor-not-allowed',
              ].join(' ')}
            >
              <i className="ri-refresh-line text-base" />
              초기화
            </button>

            <button
              type="button"
              onClick={handleOpenAddBookmark}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 active:bg-indigo-700 transition-colors"
            >
              <i className="ri-add-line text-base" />
              추가
            </button>
          </div>
        </header>
    )
}