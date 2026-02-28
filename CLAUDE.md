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
├── CLAUDE.md                # 이 파일 (프로젝트 설명)
├── docs/
│   ├── menu.md              # 메뉴 구조 + 라우팅 + 파일 매핑
│   └── hexa-game.md         # HEXA 게임 설계서
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx             # 진입점 (BrowserRouter)
│   ├── App.tsx              # 라우트 정의
│   ├── global.css           # 전역 스타일
│   ├── components/
│   │   ├── Stars.tsx        # 배경 별 애니메이션
│   │   ├── MenuCard.tsx     # 재사용 메뉴 카드
│   │   └── GameShell.tsx    # 퀴즈형 게임 프레임워크
│   └── pages/
│       ├── HomePage.tsx     # 과목 선택 (수학/과학/영어/미술/게임)
│       ├── MathPage.tsx     # 수학 하위 메뉴
│       ├── CalcPage.tsx     # 연산 하위 메뉴
│       ├── Semester21Page.tsx # 2-1학기 단원 선택
│       ├── ArithmeticGame.tsx # 덧셈/뺄셈 공통 게임
│       ├── GamesPage.tsx    # 게임 선택 메뉴
│       └── games/
│           ├── HexaGame.tsx     # HEXA 퍼즐 게임
│           ├── ThreeDigitGame.tsx # 1단원: 세자리수
│           └── ShapeGame.tsx    # 2단원: 여러가지도형
```

## 문서
- `docs/menu.md` — 전체 메뉴 구조, 라우팅, 파일 매핑 (메뉴 추가/변경 시 참조)
- `docs/hexa-game.md` — HEXA 게임 설계서 (Phase, 함수, 점수, 할 일 등)

## 디자인 시스템
- 배경: 파스텔 그라데이션 + 떠다니는 별
- 카드: border-radius 28px, 아랫면 그림자(입체감)
- 폰트: 굵고 크게 (clamp 사용)
- 터치 피드백: `:active` translateY + 그림자 축소
- 반응형: 모바일 기본, 태블릿(≥768px) 꽉 찬 화면
- 게임: 375px 기준 고정 크기 + scale 스케일링

## 개발 명령어
```bash
npm run dev     # 개발 서버 (localhost:5173)
npm run build   # 프로덕션 빌드
```

## 앞으로 할 일
- [ ] HEXA: 하드드롭, 효과음, 최고점수 저장
- [ ] 곱셈/나눗셈 게임 추가
- [ ] 게임: 카드 짝맞추기, 두더지잡기, 퍼즐
- [ ] 오답 시 힌트 기능
- [ ] 다른 과목 콘텐츠 (과학/영어/미술)
