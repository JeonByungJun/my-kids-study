# 어린이 공부방 — 메뉴 구조

## 메인 (`/`)
| 아이콘 | 메뉴 | 경로 | 상태 |
|--------|------|------|------|
| 🔢 | 수학 | `/math` | 활성 |
| 🔬 | 과학 | — | 준비 중 |
| 🔤 | 영어 | — | 준비 중 |
| 🎨 | 미술 | — | 준비 중 |

## 수학 (`/math`)
| 아이콘 | 메뉴 | 경로 | 상태 |
|--------|------|------|------|
| ➕ | 연산 | `/math/calc` | 활성 |
| 📖 | 2-1학기 | `/math/semester21` | 활성 |
| 📐 | 도형 | — | 준비 중 |
| 📊 | 통계 | — | 준비 중 |

## 연산 (`/math/calc`)
| 아이콘 | 메뉴 | 경로 | 상태 |
|--------|------|------|------|
| ➕ | 덧셈 (받아올림) | `/math/addition` | 활성 |
| ➖ | 뺄셈 (받아내림) | `/math/subtraction` | 활성 |

## 2-1학기 수학 (`/math/semester21`)
| 아이콘 | 단원 | 경로 | 상태 |
|--------|------|------|------|
| 💯 | 1단원: 세자리수 | `/math/semester21/unit1` | 활성 |
| 📐 | 2단원: 여러가지도형 | `/math/semester21/unit2` | 준비 중 |
| ➕ | 3단원: 덧셈과뺄셈 | `/math/semester21/unit3` | 준비 중 |
| 📏 | 4단원: 길이재기 | `/math/semester21/unit4` | 준비 중 |
| 📊 | 5단원: 분류하기 | `/math/semester21/unit5` | 준비 중 |
| ✖️ | 6단원: 곱셈 | `/math/semester21/unit6` | 준비 중 |

---

## 파일 매핑
| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `HomePage.tsx` | 과목 선택 |
| `/math` | `MathPage.tsx` | 수학 하위 메뉴 |
| `/math/calc` | `CalcPage.tsx` | 연산 (덧셈/뺄셈) |
| `/math/addition` | `ArithmeticGame.tsx` | 받아올림 덧셈 게임 |
| `/math/subtraction` | `ArithmeticGame.tsx` | 받아내림 뺄셈 게임 |
| `/math/semester21` | `Semester21Page.tsx` | 2-1학기 단원 선택 |
| `/math/semester21/unit1` | `games/ThreeDigitGame.tsx` | 1단원: 세자리수 |
