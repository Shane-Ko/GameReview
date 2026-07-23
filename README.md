# GameReview - Dark Realm

다크 판타지 테마의 게임 리뷰 사이트

## 기술 스택

- **Frontend**: Vite + React + TypeScript
- **Routing**: React Router
- **UI**: Swiper.js (히어로 슬라이드, 이미지 캐러셀)
- **Styling**: CSS (Cinzel + Noto Serif KR + Inter)
- **Backend (Mock)**: json-server

## 주요 기능

- 게임 목록 (30+ 개), 장르 필터, 정렬
- 게임 상세 모달 (이미지 캐러셀, 별점, 리뷰)
- 리뷰 CRUD
- 좋아요/찜 토글 (PATCH)
- 찜 항목만 보기 필터
- 관리자 페이지 (게임 등록/수정/삭제)
- 베스트 페이지 (Top 10)
- 커스텀 삭제 확인 모달
- 반응형 (모바일/태블릿/데스크탑)

## 실행 방법

```bash
# 의존성 설치
npm install

# json-server (별도 터미널)
npm run server

# React 개발 서버
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 폴더 구조

\`\`\`
src/
├── components/     # 재사용 컴포넌트
├── pages/          # 라우트 페이지
├── types/          # TypeScript 타입 정의
├── App.tsx
└── App.css
\`\`\`