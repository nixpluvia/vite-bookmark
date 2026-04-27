import { use, useState } from 'react'
import { formatDistanceToNow } from "date-fns";
import { ko } from 'date-fns/locale';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RatingStar from '../RatingStar'
import useStore from '../../store/useStore';
import useBookmarksStore from '../../store/useBookmarksStore';

/**
 * 북마크 카드 컴포넌트
 * @param {object}   bookmark   - 북마크 데이터
 * @param {function} onRate     - (id, rating) => void
 * @param {function} onDelete   - (id) => void
 * @param {function} onEditBookmark     - (bookmark) => void
 * @param {function} onOpenImageModal - (imageUrl) => void
 */
export default function BookmarkCard({ id, bookmark, onDelete, onEditBookmark, onOpenImageModal, isDragDisabled }) {
  const cardTemplate = useStore((state) => state.cardTemplate);
  const onRate = useBookmarksStore((state) => state.actions.editBookmark);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <li className="h-full" ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {cardTemplate === "thumbnail" ? (
        thumbnailCard({ bookmark, onRate, onDelete, onEditBookmark, onOpenImageModal, isDragging })
      ) : (
        defaultCard({ bookmark, onRate, onDelete, onEditBookmark, isDragging })
      )}
    </li>
  )
}

function defaultCard({ bookmark, onRate, onDelete, onEditBookmark, isDragging }) {
  const { id, url, title, description, category, rating, createdAt } = bookmark

  const domain = (() => {
    try { return new URL(url).hostname } catch { return url }
  })()

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  const dateLabel = formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ko })

  return (
    <article className="group flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* 카드 헤더 */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <img
          src={faviconUrl}
          alt=""
          width={20}
          height={20}
          className="mt-0.5 shrink-0 rounded-sm"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 truncate leading-snug">
            {bookmark.title || domain}
          </h3>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline truncate block mt-0.5 leading-none"
            style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
          >
            {domain}
          </a>
        </div>

        {/* 액션 버튼 (호버 시 표시) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            aria-label="편집"
            onClick={() => onEditBookmark(bookmark)}
            className="flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <i className="ri-edit-line text-sm" />
          </button>
          <button
            type="button"
            aria-label="삭제"
            onClick={() => onDelete(bookmark)}
            className="flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <i className="ri-delete-bin-line text-sm" />
          </button>
        </div>
      </div>

      {/* 설명 */}
      {description && (
        <p className="px-4 text-xs text-slate-500 leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      {/* 카드 푸터 */}
      <div className="flex items-center justify-between px-4 py-3 mt-auto border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500">
            {category}
          </span>
          <span className="text-xs text-slate-300">{dateLabel}</span>
        </div>
        <RatingStar
          rating={rating}
          onChange={(r) => {
            if (isDragging) return;
            if (r === rating) r = 0
            onRate(id, {rating: r})
          }}
          size="text-sm"
        />
      </div>
    </article>
  )
}


function thumbnailCard({ bookmark, onRate, onDelete, onEditBookmark, onOpenImageModal, isDragging }) {
  const { id, url, title, description, category, rating, memo, createdAt, thumbnail } = bookmark

  const domain = (() => {
    try { return new URL(url).hostname } catch { return url }
  })()

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  const dateLabel = formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ko })

  return (
    <article className="group flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* 카드 헤더 */}
        {thumbnail ? (
          <button
            type="button"
            onClick={() => onOpenImageModal(thumbnail)}
            className="flex overflow-hidden w-full aspect-[16/9] items-center justify-center bg-slate-50 object-contain"
          >
            <img src={thumbnail} alt="" className="w-full h-full object-cover" />
          </button>
        ) : (
          <div className="flex overflow-hidden w-full aspect-[16/9] items-center justify-center bg-slate-50 object-contain">
            <i className="ri-image-line text-3xl" />
          </div>
        )}
      <div className="flex items-start gap-3 p-4 pb-3">
        <img
          src={faviconUrl}
          alt=""
          width={20}
          height={20}
          className="mt-0.5 shrink-0 rounded-sm"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 truncate leading-snug">
            {bookmark.title || domain}
          </h3>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline truncate block mt-0.5 leading-none"
            style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
          >
            {domain}
          </a>
        </div>

        {/* 액션 버튼 (호버 시 표시) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            aria-label="편집"
            onClick={() => onEditBookmark(bookmark)}
            className="flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <i className="ri-edit-line text-sm" />
          </button>
          <button
            type="button"
            aria-label="삭제"
            onClick={() => onDelete(bookmark)}
            className="flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <i className="ri-delete-bin-line text-sm" />
          </button>
        </div>
      </div>

      {/* 카드 푸터 */}
      <div className="flex items-center justify-between px-4 py-3 mt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500">
            {category}
          </span>
          <span className="text-xs text-slate-300">{dateLabel}</span>
        </div>
        <RatingStar
          rating={rating}
          onChange={(r) => {
            if (isDragging) return;
            if (r === rating) r = 0
            onRate(id, {rating: r})
          }}
          size="text-sm"
        />
      </div>
    </article>
  )
}