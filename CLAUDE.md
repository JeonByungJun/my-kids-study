# 어린이 공부방 프로젝트

## 프로젝트 개요
아이들을 위한 학습 웹사이트. Vite + React + TypeScript + PWA.
태블릿·스마트폰 터치 환경 최우선. 서버 불필요.

## 기술 스택
- **프론트엔드**: React 19 + TypeScript + Vite
- **라우팅**: react-router-dom
- **스타일**: 전역 CSS (`src/global.css`)
- **PWA**: vite-plugin-pwa (오프라인 캐싱, 홈화면 추가)
- **배포**: Vercel (GitHub 연동 자동 배포)

## 프로젝트 구조
```
ChildApp/
├── index.html
├── package.json
├── vite.config.ts
├── vercel.json              # SPA 라우팅 rewrite
├── public/
│   └── favicon.svg
├── scripts/
│   └── generate-icons.html  # PWA 아이콘 생성 도구
├── src/
│   ├── main.tsx             # 진입점 (BrowserRouter)
│   ├── App.tsx              # 라우트 정의
│   ├── global.css           # 전역 스타일
│   ├── components/
│   │   ├── Stars.tsx        # 배경 별 애니메이션
│   │   └── MenuCard.tsx     # 재사용 메뉴 카드
│   └── pages/
│       ├── HomePage.tsx     # 과목 선택
│       ├── MathPage.tsx     # 수학 하위 메뉴 (연산·도형·통계)
│       ├── CalcPage.tsx     # 연산 하위 메뉴 (덧셈·뺄셈)
│       └── ArithmeticGame.tsx  # 덧셈/뺄셈 공통 게임
```

## 라우팅
```
/                  → HomePage (과목 선택)
/math              → MathPage (연산·도형·통계)
/math/calc         → CalcPage (덧셈·뺄셈 선택)
/math/addition     → ArithmeticGame (받아올림 덧셈)
/math/subtraction  → ArithmeticGame (받아내림 뺄셈)
```

## 연산 게임 구조 (ArithmeticGame)
- **mode prop**: `'addition'` | `'subtraction'`으로 동작 전환
- **문제 생성**: 덧셈은 받아올림 보장, 뺄셈은 받아내림 보장
- **캔버스**: 자유 풀이 영역 (손글씨 계산 과정)
- **숫자패드**: 0~9 + 지우기(←) + 확인(✓), 양쪽에 🗑️(캔버스 지우기) / CE(입력 초기화)
- **정답 표시**: 숫자패드 배경 바로 위에 가변 크기 카드
- **결과**: fixed 최상위 모달, 정답 시 컨페티 + 다음 문제, 오답 시 1.5초 후 자동 닫힘 + 캔버스·입력 초기화

## 디자인 시스템
- 배경: 파스텔 그라데이션 + 떠다니는 별
- 카드: border-radius 28px, 아랫면 그림자(입체감)
- 폰트: 굵고 크게 (clamp 사용)
- 터치 피드백: `:active` translateY + 그림자 축소
- 뒤로 버튼: 메뉴 페이지에서 fixed 좌측 상단, 게임 헤더에서는 헤더 내부
- 반응형: 모바일 기본, 태블릿(≥768px) 꽉 찬 화면

## 개발 명령어
```bash
npm run dev     # 개발 서버 (localhost:5173)
npm run build   # 프로덕션 빌드
```

## 앞으로 할 일
- [ ] 곱셈/나눗셈 추가
- [ ] 오답 시 힌트 기능
- [ ] 다른 과목 콘텐츠
- [ ] PWA 아이콘 PNG 생성 (scripts/generate-icons.html)
