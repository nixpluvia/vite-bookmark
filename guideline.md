## 📄 AI Agent Instructions: React-Powered Bookmark Dashboard

### 1. 프로젝트 개요 (Context)
* **목표:** Vite + React 환경에서 개인용 북마크 수집 및 평가 대시보드 개발.
* **사용자 배경:** 마크업 전문가이자 IT 퍼블리셔. UI 라이브러리(shadcn/ui 등)를 패키지로 설치해 사용하는 것보다, **직접 Tailwind로 컴포넌트를 설계하고 제어**하는 방식을 선호함.
* **핵심 기능:**
    1.  `Ctrl + V` 전역 이벤트 감지를 통한 URL 수집 모달 오픈.
    2.  카테고리 분류, 별점 평가, 메모 기능.
    3.  데이터 영속성 (Vite API를 통한 JSON 파일 저장 또는 LocalStorage).

### 2. 기술 스택 가이드 (Tech Stack)
* **Core:** React 18 (Functional Components, Hooks)
* **Build Tool:** Vite (최신 버전)
* **Styling:** Tailwind CSS v4 (CSS-first 방식 적용)
* **Icons:** Remix Icon (`ri-` 클래스 기반)
* **State Management:** React `useState`, `useEffect`, `useContext` (필요 시)
* **Data Handling:** `axios` 또는 `fetch` (JSON 데이터 통신용)

### 3. 디자인 및 마크업 지침 (Design Guidelines)
* **UI 스타일:** `shadcn/ui`의 정갈한 미니멀리즘 지향.
    * 배경: `bg-slate-50`, 카드: `bg-white`, 보더: `border-slate-200`, 그림자: `shadow-sm`.
* **컴포넌트 설계:**
    * 모든 UI 요소는 외부 UI Kit 없이 **순수 Tailwind 클래스**로 직접 구현할 것.
    * 컴포넌트는 가독성을 위해 작은 단위로 분리(Modal, Card, RatingStar 등)하되, 마크업 구조가 직관적이어야 함.
* **레이아웃:** Sidebar(카테고리 필터) + Main Content(북마크 그리드/리스트) 구조.

### 4. 코드 작성 규칙 (React Specific)
* **이벤트 핸들링:** 전역 `keydown` 리스너를 통해 클립보드 데이터를 안전하게 읽어오는 커스텀 훅(`useClipboard`)을 작성할 것.
* **가독성:** 시맨틱 태그를 유지하며, Tailwind 클래스 정렬 순서(Layout -> Box Sizing -> Typography -> Others)를 일관되게 유지할 것.
* **Tailwind v4 적용:** `tailwind.config.js` 대신 CSS 변수 테마 설정(@theme)을 적극 활용할 것.
* **Props 및 타입:** 마크업 전문가가 이해하기 쉽도록 명확한 Props 네이밍을 사용하고, 데이터 구조(JSON)는 `navigation.json`에서 보여준 정돈된 형식을 따를 것.

### 5. AI 에이전트 수행 미션 (Mission)
1.  **모달 인터랙션:** 사용자가 `Ctrl+V`를 눌렀을 때 클립보드의 URL을 파싱하여 입력 폼에 자동 입력하는 로직을 최우선으로 생성한다.
2.  **데이터 저장:** 현재 개발 환경임을 고려하여, 우선은 `localStorage` 저장 로직을 제공하되, 나중에 Node.js(Vite Server)를 통해 실제 JSON 파일로 저장할 수 있는 확장성을 고려하여 코드를 짠다.
3.  **UI 완성도:** 별점(Rating) 시스템은 단순 숫자가 아닌, 클릭 가능한 별 모양 아이콘(`ri-star-fill`)으로 시각화한다.
4.  **필터링:** 카테고리 클릭 시 리스트가 실시간으로 필터링되는 반응형 대시보드 로직을 구현한다.

---

### 💡 추가 조언 (React 전환 시 참고)

1.  **Tailwind v4 설정:** 앞서 논리적으로 해결하신 것처럼, React에서도 `@tailwindcss/vite` 플러그인을 사용하여 설정 파일 없이 CSS에서 테마를 관리하는 방식을 유지해 보세요. AI에게 "Tailwind v4 CSS-first 방식으로 짜줘"라고 하면 훨씬 깔끔한 코드를 줍니다.
2.  **JSON 데이터 보존:** 업로드하신 `navigation.json` 처럼 프로젝트 메타 정보와 메뉴 구조를 분리하는 방식은 북마크 데이터 구조 설계에도 아주 좋은 모범 사례입니다.
3.  **AI 활용:** "이 컴포넌트를 Tailwind v4의 `@apply` 없이 인라인 클래스로만 짜되, 중복되는 스타일은 React 변수로 빼서 가독성을 높여줘"라고 요청하면 유지보수와 AI 생산성 사이의 균형을 잡기 좋습니다.