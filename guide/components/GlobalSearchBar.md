# GlobalSearchBar 컴포넌트 가이드

## 개요
검색어, 별점, 날짜 범위 필터를 관리하고 결과 개수와 북마크 추가 버튼을 제공합니다.

## 사용 라이브러리
- React: useMemo, useState
- react-day-picker: 날짜 선택 캘린더
- date-fns: parseISO, isValid, format

## Props
- searchQuery, setSearchQuery
- ratingFilter, setRatingFilter
- dateFrom, setDateFrom
- dateTo, setDateTo
- resetFilter, hasFilter
- filtered
- handleOpenAddBookmark

## 내부 프로세스
1. dateFrom/dateTo 문자열을 Date 객체로 파싱합니다.
2. 시작일/종료일 캘린더에서 선택값을 yyyy-MM-dd로 정규화합니다.
3. 시작일이 종료일보다 늦거나 종료일이 시작일보다 빠르면 자동 보정합니다.
4. 별점 버튼으로 최소 별점 필터를 토글합니다.
5. 현재 필터 상태(hasFilter)와 결과 수(filtered.length)를 표시합니다.

## 리팩토링 포인트
- DayPicker selected/defaultMonth에 문자열이 아닌 Date 객체를 일관 전달하도록 수정
