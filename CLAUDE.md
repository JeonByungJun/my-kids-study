# 어린이 공부방 프로젝트

## 프로젝트 개요
아이들을 위한 학습 웹사이트. Vite + React + TypeScript.
태블릿·스마트폰 터치 환경 최우선. 서버 불필요.

## 기술 스택
- **프론트엔드**: React 19 + TypeScript + Vite
- **라우팅**: react-router-dom
- **스타일**: 전역 CSS (`src/global.css`)

## 프로젝트 구조
```
ChildApp/
├── index.html
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx                # 진입점 (BrowserRouter)
│   ├── App.tsx                 # 라우트 정의
│   ├── global.css              # 전역 스타일
│   ├── components/
│   │   ├── Stars.tsx           # 배경 별 애니메이션
│   │   └── MenuCard.tsx        # 재사용 메뉴 카드
│   └── pages/
│       ├── HomePage.tsx        # 과목 선택
│       ├── MathPage.tsx        # 수학 하위 메뉴
│       └── AdditionGame.tsx    # 덧셈 게임 (캔버스 + 숫자패드)
```

## 라우팅
```
/              → HomePage (과목 선택)
/math          → MathPage (연산·도형·통계)
/math/addition → AdditionGame (두 자리 덧셈)
```

## 덧셈 게임 구조
- **캔버스**: 자유 풀이 영역 (손글씨로 계산 과정 작성)
- **숫자패드**: 0~9 버튼 + 지우기(←) + 확인(✓)으로 정답 입력
- **정답 표시**: 캔버스 우상단에 입력된 숫자 표시
- **문제**: 두 자리 + 두 자리 (가로/세로 랜덤)
- **결과**: 정답 시 컨페티 + 축하, 오답 시 정답 안내
- 캔버스 지우기(🗑️) / 입력 초기화(CE) 별도 버튼

## 디자인 시스템
- 배경: 파스텔 그라데이션 + 떠다니는 별
- 카드: border-radius 28px, 아랫면 그림자(입체감)
- 폰트: 굵고 크게 (clamp 사용)
- 터치 피드백: `:active` translateY + 그림자 축소
- 숫자패드: 3×4 그리드, 큰 터치 영역

## 개발 명령어
```bash
npm run dev     # 개발 서버 (localhost:5173)
npm run build   # 프로덕션 빌드
```

## 앞으로 할 일
- [ ] 뺄셈 게임 추가
- [ ] 곱셈/나눗셈 추가
- [ ] 오답 시 힌트 기능
- [ ] 다른 과목 콘텐츠 (한글/영어 — OCR 서버 추가 시)
