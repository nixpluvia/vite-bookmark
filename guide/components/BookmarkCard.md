# BookmarkCard 컴포넌트 가이드

## 개요
개별 북마크를 카드 형태로 표시하며, 편집/삭제/별점 변경 액션을 제공합니다.

## 사용 라이브러리
- React: useState
- date-fns: formatDistanceToNow
- date-fns/locale: ko
- 재사용 컴포넌트: RatingStar

## Props
- bookmark
- onRate(id, rating)
- onDelete(id)
- onEdit(bookmark)

## 내부 프로세스
1. bookmark.url에서 도메인을 파싱하고 favicon URL을 생성합니다.
2. createdAt을 상대 시간(예: n분 전)으로 포맷합니다.
3. 카드 헤더에서 편집/삭제 버튼을 제공하고 삭제 시 확인 다이얼로그를 띄웁니다.
4. 하단에서 RatingStar를 통해 점수 변경 이벤트를 전달합니다.

## 주의 사항
- favicon 로드 실패 시 이미지 요소를 숨기도록 처리되어 있습니다.
- 삭제 확인은 카드 내부 로컬 상태(confirmOpen)로 제어됩니다.
