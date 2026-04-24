# Modal 컴포넌트 가이드

## 개요
북마크 추가/편집을 위한 폼 모달입니다. URL, 썸네일, 제목, 설명, 카테고리, 별점, 메모를 입력받습니다.

## 사용 라이브러리
- React: useState, useEffect, useRef
- 재사용 컴포넌트: RatingStar

## Props
- isOpen
- initialUrl
- editTarget
- categories
- onSubmit
- onClose
- activeCategory
- initialImage
- initialImageUrl
- onDeleteThumbnail

## 내부 프로세스
1. 컴포넌트 생성 시 editTarget 여부에 따라 초기 폼 상태를 구성합니다.
2. 열릴 때 URL 입력 필드로 포커스를 이동합니다.
3. 제출 시 onSubmit에 bookmark 데이터와 이미지 파일(initialImage)을 함께 전달합니다.
4. 썸네일 제거 시 폼에서 thumbnail을 비우고, 편집 모드에서는 onDeleteThumbnail을 호출합니다.

## 리팩토링 포인트
- setState-in-effect 패턴 제거
- App의 모달 세션 key 재마운트 전략으로 재오픈 시 폼 초기화 안정화
- Enter 처리 payload 불일치 문제를 제거하고 폼 submit 경로 일원화
