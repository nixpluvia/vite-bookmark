# ModalCategory 컴포넌트 가이드

## 개요
카테고리 추가/정렬/삭제를 관리하는 모달입니다.

## 사용 라이브러리
- React: useState, useEffect, useRef, useCallback

## Props
- isOpen
- categories
- onUpdateCategories
- onClose

## 내부 프로세스
1. 현재 카테고리에서 전체를 제외한 목록을 로컬 상태로 관리합니다.
2. 새 카테고리 입력 시 공백/중복을 검증합니다.
3. 위/아래 이동 버튼으로 카테고리 순서를 조정합니다.
4. 삭제 버튼 클릭 시 확인 다이얼로그를 통해 최종 삭제를 수행합니다.
5. 적용 버튼 클릭 시 onUpdateCategories로 변경 목록을 상위에 전달합니다.

## 리팩토링 포인트
- 카테고리 추가 시 props 배열이 아니라 로컬 최신 배열 기준으로 중복 검증
- 삭제 대상 인덱스 검증 추가로 방어 코드 보강
- App의 key 재마운트 방식으로 열기 시 초기 상태 일관성 확보
