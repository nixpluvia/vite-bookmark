# Vite Bookmark Guide

이 폴더는 현재 프로젝트의 주요 UI 컴포넌트 구조와 동작 흐름을 빠르게 이해하기 위한 문서입니다.

## 문서 구성
- App: 앱 루트 컨테이너, 상태/필터/모달 오케스트레이션
- components/Sidebar: 카테고리 네비게이션
- components/GlobalSearchBar: 검색/필터/날짜 범위/추가 버튼
- components/BookmarkCard: 북마크 카드 및 삭제 확인 UI
- components/Modal: 북마크 추가/수정 폼
- components/ModalCategory: 카테고리 관리 모달
- components/RatingStar: 재사용 별점 입력 UI

## 읽는 순서 권장
1. App
2. Sidebar + GlobalSearchBar
3. BookmarkCard
4. Modal + ModalCategory
5. RatingStar
