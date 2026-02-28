# HEXA 게임 설계서

## 개요
Columns 스타일 보석 낙하 퍼즐 게임.
세로 3개 보석 묶음이 떨어지고, 같은 보석 3개 이상 연결 시 제거.

## 파일
- `src/pages/games/HexaGame.tsx` — 게임 전체 (로직 + UI)
- `src/global.css` — `.hexa-*` 클래스 (329행~)

## 보드
- **크기**: 7열 × 13행
- **레퍼런스 해상도**: 375 × 720px (scale 스케일링)

## 게임 흐름
```
시작화면 → PLAY
  → 피스 생성 (3개 보석, 중앙 col=3)
  → 자동 낙하 (setInterval, dropInterval ms)
  → 조작: ←→ 이동 / 회전 / ↓ 하강
  → 바닥 도달 → 보드에 고정
  → 매치 체크 (가로/세로/대각선 3+)
    → 매치 있음: 깜빡임(300ms) → 제거 → 중력 → 연쇄 체크
    → 매치 없음: 다음 피스 생성
  → 스폰 위치 막힘 → 게임 오버
```

## Phase 상태
| Phase | 설명 |
|-------|------|
| `start` | 시작 화면 (PLAY 버튼) |
| `playing` | 피스 낙하 중, 조작 가능 |
| `clearing` | 매치 깜빡임 애니메이션 (300ms) |
| `cascading` | 중력 적용 후 연쇄 체크 (150ms) |
| `paused` | 일시정지 오버레이 |
| `gameover` | 게임 오버 오버레이 |

## 순수 함수
| 함수 | 입력 → 출력 | 역할 |
|------|------------|------|
| `createEmptyBoard()` | → board | 빈 7×13 보드 |
| `generateGems()` | → [n,n,n] | 랜덤 3개 보석 |
| `canMoveDown(board, piece)` | → bool | 하강 가능 여부 |
| `canMoveSide(board, piece, dir)` | → bool | 좌우 이동 가능 여부 |
| `lockPiece(board, piece)` | → board | 피스를 보드에 고정 |
| `findMatches(board)` | → MatchedCell[] | 3+ 매치 탐색 (4방향) |
| `removeMatched(board, cells)` | → board | 매치 셀 제거 |
| `applyGravity(board)` | → board | 중력 적용 |
| `calculateScore(cleared, combo)` | → number | 점수 계산 |
| `getDropInterval(level)` | → ms | 낙하 간격 |
| `getPieceGemAt(piece, r, c)` | → number\|null | 셀에 피스 존재 여부 |

## 점수 시스템
- 기본: 제거 수 × 10 × (콤보 + 1)
- 레벨업: 20개 제거당 +1
- 낙하 속도: max(1000 - (level-1)×100, 100) ms

## 보석 종류 (7개)
| 이름 | 모양 | 색상 |
|------|------|------|
| ruby | 다이아몬드 | 빨강 |
| sapphire | 원 | 파랑 |
| emerald | 육각형 | 초록 |
| topaz | 삼각형 | 노랑 |
| amethyst | 별 | 보라 |
| citrine | 오각형 | 주황 |
| aqua | 물방울 | 하늘 |

## 컨트롤
- **버튼**: ← → (이동), 회전 (보석 순서 순환), ↓ (소프트드롭)
- **키보드**: ArrowLeft/Right/Up/Down
- **회전**: [a,b,c] → [c,a,b] (하단→상단 순환)

## CSS 클래스
| 클래스 | 역할 |
|--------|------|
| `.hexa-viewport` | 전체 화면 래퍼 (중앙 정렬) |
| `.hexa-page` | 375×720 고정 컨테이너 (scale) |
| `.hexa-header` | 상단 바 (일시정지 + 타이틀) |
| `.hexa-body` | 본체 (사이드바 + 보드 + 컨트롤) |
| `.hexa-sidebar` | Level/Score/Next 패널 |
| `.hexa-board` | 7×13 그리드 |
| `.hexa-controls` | 하단 조작 버튼 |
| `.hexa-overlay` | 시작/일시정지/게임오버 오버레이 |
| `.hexa-cell-flash` | 매치 깜빡임 애니메이션 |

## 할 일
- [ ] 하드드롭 (즉시 바닥까지)
- [ ] 효과음
- [ ] 콤보 텍스트 애니메이션 (+30 등)
- [ ] 최고 점수 로컬스토리지 저장
