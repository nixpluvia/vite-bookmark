# RatingStar 컴포넌트 가이드

## 개요
1~5점 별점 UI를 제공하는 재사용 컴포넌트입니다.

## 사용 라이브러리
- React 함수형 컴포넌트
- Remix Icon 클래스(ri-star-fill, ri-star-line)

## Props
- rating: 현재 점수
- onChange: 별 클릭 시 호출
- readonly: 읽기 전용 여부
- size: 아이콘 텍스트 크기 클래스

## 내부 프로세스
1. 1~5 숫자 배열을 순회해 버튼 5개를 생성합니다.
2. 현재 rating과 비교해 채움/비움 아이콘을 선택합니다.
3. readonly가 false일 때만 클릭 이벤트로 onChange를 호출합니다.

## 사용 위치
- BookmarkCard: 카드별 별점 변경
- Modal: 북마크 생성/편집 시 별점 입력
