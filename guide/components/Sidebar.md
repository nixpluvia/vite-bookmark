# Sidebar 컴포넌트 가이드

## 개요
카테고리 목록을 렌더링하고 현재 카테고리 선택 상태를 표시하는 네비게이션 컴포넌트입니다.

## 사용 라이브러리
- React 함수형 컴포넌트
- Remix Icon 클래스(아이콘 표시)

## Props
- categories: 전체 카테고리 배열
- activeCategory: 현재 선택 카테고리
- counts: 카테고리별 북마크 수 맵
- onSelect: 카테고리 선택 핸들러
- onOpenCategoryModal: 카테고리 관리 모달 오픈 핸들러

## 내부 프로세스
1. categories를 순회하면서 버튼 목록을 생성합니다.
2. activeCategory와 비교해 활성 스타일을 적용합니다.
3. counts 값이 0보다 클 때만 뱃지를 표시합니다.
4. 하단 버튼 클릭으로 카테고리 관리 모달을 엽니다.
