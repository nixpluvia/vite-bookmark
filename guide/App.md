# App 컴포넌트 가이드

## 개요
App은 화면 전체 레이아웃과 핵심 상태를 관리하는 루트 컴포넌트입니다. 북마크 데이터 훅, 필터 상태, 모달 열기/닫기, 카테고리 관리 흐름을 연결합니다.

## 사용 라이브러리
- React: useState, useMemo, useCallback
- 커스텀 훅: useBookmarks, useClipboard

## 입력/출력
- 입력: useClipboard를 통해 URL 또는 이미지 붙여넣기 이벤트 수신
- 출력: Sidebar, GlobalSearchBar, BookmarkCard 리스트, Modal, ModalCategory 렌더링

## 내부 프로세스
1. useBookmarks에서 bookmarks/categories와 CRUD 액션을 가져옵니다.
2. useClipboard 이벤트를 받아 pendingUrl 또는 pendingImage 상태를 갱신합니다.
3. useMemo로 카테고리 카운트(counts)와 필터 결과(filtered)를 계산합니다.
4. 추가/편집 액션 시 Modal을 열고 제출 시 addBookmark/updateBookmark를 호출합니다.
5. 카테고리 편집 시 ModalCategory에서 새 목록을 받아 updateCategories를 호출합니다.

## 리팩토링 포인트
- 모달 재오픈 시 상태 초기화를 key 기반 세션 방식으로 안정화
- pending 이미지 정리 로직을 단일 함수(clearPendingImageState)로 통합
- 콜백 의존성 정리로 훅 경고 제거
