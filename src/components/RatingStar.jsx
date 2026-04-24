/**
 * 클릭 가능한 별점 컴포넌트 (1~5점)
 * @param {number}   rating     - 현재 별점
 * @param {function} onChange   - 별 클릭 시 콜백 (newRating: number) => void
 * @param {boolean}  readonly   - true면 클릭 비활성화
 * @param {string}   size       - 아이콘 크기 클래스 (기본 'text-base')
 */
export default function RatingStar({ rating = 0, onChange, readonly = false, size = 'text-base' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star}점`}
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          className={[
            size,
            'leading-none transition-transform',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            star <= rating ? 'text-amber-400' : 'text-slate-200',
          ].join(' ')}
          style={{ background: 'none', border: 'none', padding: '1px' }}
        >
          <i className={star <= rating ? 'ri-star-fill' : 'ri-star-line'} />
        </button>
      ))}
    </div>
  )
}
