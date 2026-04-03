# 어린이 공부방 — 메뉴 구조

## 메인 (`/`)
| 아이콘 | 메뉴 | 경로 | 상태 |
|--------|------|------|------|
| 🔢 | 수학 | `/math` | 활성 |
| 🔬 | 과학 | — | 준비 중 |
| 🔤 | 영어 | — | 준비 중 |
| 🎨 | 미술 | — | 준비 중 |
| 🎮 | 게임 | `/games` | 활성 |

## 수학 (`/math`)
| 아이콘 | 메뉴 | 경로 | 상태 |
|--------|------|------|------|
| ➕ | 연산 | `/math/calc` | 활성 |
| 📖 | 2-1학기 | `/math/semester21` | 활성 |
| 📗 | 2-2학기 | `/math/semester22` | 활성 |
| 📐 | 도형 | — | 준비 중 |
| 📊 | 통계 | — | 준비 중 |

## 연산 (`/math/calc`)
| 아이콘 | 메뉴 | 경로 | 상태 |
|--------|------|------|------|
| ➕ | 덧셈 (받아올림) | `/math/addition` | 활성 |
| ➖ | 뺄셈 (받아내림) | `/math/subtraction` | 활성 |
| 📐 | 3단원 덧셈·뺄셈 | `/math/calc/addsub` | 활성 |
| ✖️ | 6단원 곱셈 입문 | `/math/calc/multiplication` | 활성 |

## 2-1학기 수학 (`/math/semester21`)
| 아이콘 | 단원 | 경로 | 상태 |
|--------|------|------|------|
| 💯 | 1단원: 세자리수 | `/math/semester21/unit1` | 활성 |
| 📐 | 2단원: 여러가지도형 | `/math/semester21/unit2` | 활성 |
| ➕ | 3단원: 덧셈과뺄셈 | `/math/calc/addsub` (공유) | 활성 |
| 📏 | 4단원: 길이재기 | `/math/semester21/unit4` | 활성 |
| 📊 | 5단원: 분류하기 | `/math/semester21/unit5` | 활성 |
| ✖️ | 6단원: 곱셈 | `/math/calc/multiplication` (공유) | 활성 |

## 2-2학기 수학 (`/math/semester22`)
| 아이콘 | 단원 | 경로 | 상태 |
|--------|------|------|------|
| 🔢 | 1단원: 네자리수 | `/math/semester22/unit1` | 준비 중 |
| ✖️ | 2단원: 곱셈구구 | `/math/semester22/unit2` | 활성 |
| 📏 | 3단원: 길이재기 (m와 cm) | `/math/semester22/unit3` | 활성 |
| ⏰ | 4단원: 시각과 시간 | `/math/semester22/unit4` | 활성 |
| 📊 | 5단원: 표와 그래프 | `/math/semester22/unit5` | 활성 |
| 🔮 | 6단원: 규칙 찾기 | `/math/semester22/unit6` | 활성 |
| 🍕 | 7단원(확장): 분수 | `/math/semester22/unit7` | 활성 |

## 게임 (`/games`)
| 아이콘 | 메뉴 | 경로 | 상태 |
|--------|------|------|------|
| 💎 | HEXA | `/games/hexa` | 활성 |
| 🃏 | 카드 짝맞추기 | `/games/memory` | 준비 중 |
| 🎯 | 두더지잡기 | `/games/whack` | 준비 중 |
| 🧩 | 퍼즐 | `/games/puzzle` | 준비 중 |

---

## 파일 매핑
| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `HomePage.tsx` | 과목 선택 |
| `/math` | `math/MathPage.tsx` | 수학 하위 메뉴 |
| `/math/calc` | `math/calc/CalcPage.tsx` | 연산 (덧셈/뺄셈) |
| `/math/addition` | `math/calc/ArithmeticGame.tsx` | 받아올림 덧셈 게임 |
| `/math/subtraction` | `math/calc/ArithmeticGame.tsx` | 받아내림 뺄셈 게임 |
| `/math/calc/addsub` | `math/calc/AddSubMenuPage.tsx` | 3단원 덧셈·뺄셈 메뉴 |
| `/math/calc/addsub/:type` | `math/calc/AddSubGame.tsx` | 3단원 덧셈·뺄셈 게임 |
| `/math/calc/multiplication` | `math/calc/MultiplicationIntroGame.tsx` | 6단원: 곱셈 입문 게임 |
| `/math/semester21` | `math/semester21/Semester21Page.tsx` | 2-1학기 단원 선택 |
| `/math/semester21/unit1` | `math/semester21/ThreeDigitGame.tsx` | 1단원: 세자리수 |
| `/math/semester21/unit2` | `math/semester21/ShapeGame.tsx` | 2단원: 여러가지도형 |
| `/math/semester21/unit4` | `math/semester21/LengthGame.tsx` | 4단원: 길이재기 (RulerSVG) |
| `/math/semester21/unit5` | `math/semester21/ClassifyGame.tsx` | 5단원: 분류하기 |
| `/math/semester22` | `math/semester22/Semester22Page.tsx` | 2-2학기 단원 선택 |
| `/math/semester22/unit2` | `math/semester22/MultiplicationGame.tsx` | 2단원: 곱셈구구 |
| `/math/semester22/unit3` | `math/semester22/LengthCmMGame.tsx` | 3단원: 길이재기 (m와 cm) |
| `/math/semester22/unit4` | `math/semester22/TimeGame.tsx` | 4단원: 시각과 시간 (ClockSVG) |
| `/math/semester22/unit5` | `math/semester22/GraphGame.tsx` | 5단원: 표와 그래프 |
| `/math/semester22/unit6` | `math/semester22/PatternGame.tsx` | 6단원: 규칙 찾기 |
| `/math/semester22/unit7` | `math/semester22/FractionGame.tsx` | 7단원(확장): 분수 |
| `/games` | `games/GamesPage.tsx` | 게임 선택 |
| `/games/hexa` | `games/HexaGame.tsx` | HEXA 퍼즐 게임 |

---

## 공용 컴포넌트
| 파일 | 사용처 | 설명 |
|------|--------|------|
| `components/GameShell.tsx` | 전 퀴즈 게임 | 퀴즈 프레임워크 (numpad/choices/multiSelect/힌트) |
| `components/MenuCard.tsx` | 전 메뉴 페이지 | 재사용 메뉴 카드 |
| `components/Stars.tsx` | App.tsx (전역) | 배경 별 애니메이션 |
| `components/ClockSVG.tsx` | TimeGame | 아날로그 시계 SVG (시침·분침 렌더링) |
| `components/RulerSVG.tsx` | LengthGame | 자 눈금 SVG (cm 단위 길이재기) |
| `components/PatternSequence.tsx` | PatternGame | 규칙 패턴 시퀀스 시각화 |

---

## 관련 문서
| 문서 | 설명 |
|------|------|
| `docs/hexa-game.md` | HEXA 게임 설계서 |
| `docs/math-2nd-grade-full-spec.md` | 2학년 수학 전 단원 게임 설계서 |
| `docs/math-2nd-grade-review.md` | 2학년 수학 문제 유형 리뷰 및 개선 제안 |
