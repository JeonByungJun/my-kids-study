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
구조 상세는 `AGENTS.md` 참조.

## 문서
- `docs/menu.md` — 전체 메뉴 구조, 라우팅, 파일 매핑 (메뉴 추가/변경 시 참조)
- `docs/hexa-game.md` — HEXA 게임 설계서 (Phase, 함수, 점수, 할 일 등)
- `docs/math-2nd-grade-full-spec.md` — 2학년 수학 전 단원(1·2학기) 게임 설계서
- `docs/math-2nd-grade-review.md` — 2학년 수학 문제 유형 리뷰 및 개선 제안

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
- [x] 곱셈 게임 추가 (6단원 곱셈 입문 + 2-2 곱셈구구)
- [x] 오답 시 힌트 기능 (GameShell hint 프로퍼티)
- [x] 2-1학기 전 단원 게임 (세자리수/도형/덧셈뺄셈/길이재기/분류하기/곱셈)
- [x] 2-2학기 전 단원 게임 (곱셈구구/길이/시각시간/표그래프/규칙찾기/분수)
- [ ] HEXA: 하드드롭, 효과음, 최고점수 저장
- [ ] 게임: 카드 짝맞추기, 두더지잡기, 퍼즐
- [ ] 2-2학기 1단원: 네자리수 게임 구현
- [ ] 나눗셈 게임 추가
- [ ] 다른 과목 콘텐츠 (과학/영어/미술)

### 기술 부채 (우선 처리)
- [ ] `useCanvasDrawing` 훅 추출 — GameShell·ArithmeticGame에 중복된 캔버스 그리기 로직 통합
- [ ] `launchConfetti()` 공용 유틸 분리 — 두 파일에 동일하게 존재하는 함수를 `src/utils/`로 이동
- [ ] `NumberPad` 공용 컴포넌트 추출 — 두 파일에 중복된 숫자패드 JSX를 독립 컴포넌트로 분리
- [ ] HexaGame `'spawning' as GamePhase` 타입 핵 수정 — `GamePhase` 타입에 `'spawning'` 추가 또는 로컬 상태 분리
