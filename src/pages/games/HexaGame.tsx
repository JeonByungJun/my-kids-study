import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Gem 타입 정의 ── */
interface GemType {
  name: string;
  shape: string;
  main: string;
  light: string;
  dark: string;
}

const GEM_TYPES: GemType[] = [
  { name: 'ruby', shape: 'diamond', main: '#ff1744', light: '#ff6e7a', dark: '#b71c1c' },
  { name: 'sapphire', shape: 'circle', main: '#2979ff', light: '#82b1ff', dark: '#0d47a1' },
  { name: 'emerald', shape: 'hexagon', main: '#00e676', light: '#69f0ae', dark: '#1b5e20' },
  { name: 'topaz', shape: 'triangle', main: '#ffea00', light: '#ffff56', dark: '#f9a825' },
  { name: 'amethyst', shape: 'star', main: '#d500f9', light: '#ea80fc', dark: '#7b1fa2' },
  { name: 'citrine', shape: 'pentagon', main: '#ff9100', light: '#ffab40', dark: '#e65100' },
  { name: 'aqua', shape: 'droplet', main: '#00e5ff', light: '#84ffff', dark: '#006064' },
];

const COLS = 6;
const ROWS = 10;
const GEM_COUNT = GEM_TYPES.length;
const BASE_SCORE = 10;
const GEMS_PER_LEVEL = 20;

/* ── 타입 ── */
type GamePhase = 'start' | 'playing' | 'clearing' | 'cascading' | 'paused' | 'gameover';

interface FallingPiece {
  col: number;
  row: number; // 하단 보석의 행
  gems: [number, number, number]; // [top, mid, bottom]
}

interface MatchedCell {
  row: number;
  col: number;
}

/* ══════════════════════════════════════ */
/*         순수 게임 로직 함수            */
/* ══════════════════════════════════════ */

function rand(max: number) {
  return Math.floor(Math.random() * max);
}

function createEmptyBoard(): (number | null)[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => null),
  );
}

function generateGems(): [number, number, number] {
  return [rand(GEM_COUNT), rand(GEM_COUNT), rand(GEM_COUNT)];
}

function getDropInterval(level: number): number {
  return Math.max(1000 - (level - 1) * 100, 100);
}

function calculateScore(cleared: number, combo: number): number {
  return cleared * BASE_SCORE * (combo + 1);
}

/** 피스가 한 칸 아래로 이동 가능한지 */
function canMoveDown(board: (number | null)[][], piece: FallingPiece): boolean {
  const nextRow = piece.row + 1;
  if (nextRow >= ROWS) return false;
  if (board[nextRow][piece.col] !== null) return false;
  return true;
}

/** 피스가 좌/우로 이동 가능한지 */
function canMoveSide(board: (number | null)[][], piece: FallingPiece, dir: -1 | 1): boolean {
  const newCol = piece.col + dir;
  if (newCol < 0 || newCol >= COLS) return false;
  for (let i = 0; i < 3; i++) {
    const r = piece.row - i;
    if (r < 0) continue;
    if (r >= ROWS) return false;
    if (board[r][newCol] !== null) return false;
  }
  return true;
}

/** 피스를 보드에 고정 */
function lockPiece(board: (number | null)[][], piece: FallingPiece): (number | null)[][] {
  const b = board.map(row => [...row]);
  for (let i = 0; i < 3; i++) {
    const r = piece.row - (2 - i); // i=0 → top, i=2 → bottom
    if (r >= 0 && r < ROWS) {
      b[r][piece.col] = piece.gems[i];
    }
  }
  return b;
}

/** 3+ 매치 찾기 (가로/세로/대각선×2) */
function findMatches(board: (number | null)[][]): MatchedCell[] {
  const matched = new Set<string>();
  const dirs = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  for (const { dr, dc } of dirs) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const gem = board[r][c];
        if (gem === null) continue;
        // 이미 시작 지점이 아닌 경우 스킵 (중복 방지)
        const pr = r - dr, pc = c - dc;
        if (pr >= 0 && pr < ROWS && pc >= 0 && pc < COLS && board[pr][pc] === gem) continue;

        const run: [number, number][] = [[r, c]];
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === gem) {
          run.push([nr, nc]);
          nr += dr;
          nc += dc;
        }
        if (run.length >= 3) {
          for (const [mr, mc] of run) matched.add(`${mr},${mc}`);
        }
      }
    }
  }

  return Array.from(matched).map(k => {
    const [r, c] = k.split(',').map(Number);
    return { row: r, col: c };
  });
}

/** 매치된 셀 제거 */
function removeMatched(board: (number | null)[][], cells: MatchedCell[]): (number | null)[][] {
  const b = board.map(row => [...row]);
  for (const { row, col } of cells) b[row][col] = null;
  return b;
}

/** 중력 적용 — 각 열에서 보석을 아래로 떨어뜨림 */
function applyGravity(board: (number | null)[][]): (number | null)[][] {
  const b = board.map(row => [...row]);
  for (let c = 0; c < COLS; c++) {
    const gems: number[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (b[r][c] !== null) gems.push(b[r][c]!);
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      const idx = ROWS - 1 - r;
      b[r][c] = idx < gems.length ? gems[idx] : null;
    }
  }
  return b;
}

/** 특정 셀에 피스의 보석이 있으면 반환 */
function getPieceGemAt(piece: FallingPiece | null, r: number, c: number): number | null {
  if (!piece || piece.col !== c) return null;
  for (let i = 0; i < 3; i++) {
    if (piece.row - (2 - i) === r) return piece.gems[i];
  }
  return null;
}

/* ══════════════════════════════════════ */
/*            SVG 헬퍼                    */
/* ══════════════════════════════════════ */

function polyPoints(n: number, cx: number, cy: number, r: number): string {
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI / n) * i - Math.PI / 2;
    return `${+(cx + r * Math.cos(a)).toFixed(1)},${+(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    return `${+(cx + r * Math.cos(a)).toFixed(1)},${+(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

/* ══════════════════════════════════════ */
/*          UI 서브컴포넌트               */
/* ══════════════════════════════════════ */

function GemDefs() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden>
      <defs>
        {GEM_TYPES.map((gem) => (
          <radialGradient key={gem.name} id={`g-${gem.name}`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor={gem.light} />
            <stop offset="50%" stopColor={gem.main} />
            <stop offset="100%" stopColor={gem.dark} />
          </radialGradient>
        ))}
        <radialGradient id="gem-hl" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity={0.9} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="panel-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a3e" />
          <stop offset="100%" stopColor="#0a0a1a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function InfoPanel({ label, value, color = '#00fff5' }: { label: string; value: string | number; color?: string }) {
  return (
    <svg viewBox="0 0 100 80" className="hexa-info-svg">
      <rect x="2" y="2" width="96" height="76" rx="10" fill="url(#panel-bg)" stroke="#333" strokeWidth={1.5} />
      <text x="50" y="26" textAnchor="middle" fill="#888" fontSize={11} fontWeight={700}
        fontFamily="'Courier New',monospace" letterSpacing={2}>{label}</text>
      <text x="50" y="58" textAnchor="middle" fill={color} fontSize={24} fontWeight={900}
        fontFamily="'Courier New',monospace">{value}</text>
    </svg>
  );
}

function PauseBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button className="hexa-pause" onClick={onClick}>
      <svg viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="#1a1a2e" stroke="#555" strokeWidth={2} />
        <rect x="16" y="14" width="5" height="20" rx="2" fill="#ccc" />
        <rect x="27" y="14" width="5" height="20" rx="2" fill="#ccc" />
      </svg>
    </button>
  );
}

function CtrlBtn({ dir, onClick }: { dir: 'left' | 'right' | 'down' | 'rotate'; onClick?: () => void }) {
  let inner: React.ReactNode;
  switch (dir) {
    case 'left':
      inner = <path d="M28,14 L18,24 L28,34" stroke="#ccc" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      break;
    case 'right':
      inner = <path d="M20,14 L30,24 L20,34" stroke="#ccc" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      break;
    case 'down':
      inner = <path d="M14,20 L24,30 L34,20" stroke="#ccc" strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      break;
    case 'rotate':
      inner = (
        <>
          <path d="M16,24 A10,10 0 1,1 24,34" stroke="#ccc" strokeWidth={3} fill="none" strokeLinecap="round" />
          <polygon points="24,30 24,38 30,34" fill="#ccc" />
        </>
      );
      break;
  }
  return (
    <button className="hexa-ctrl-svg" onClick={onClick}>
      <svg viewBox="0 0 48 48">
        <rect x="2" y="2" width="44" height="44" rx="10" fill="#2a2a4a" stroke="#555" strokeWidth={2} />
        {inner}
      </svg>
    </button>
  );
}

function GemShape({ gem }: { gem: GemType }) {
  const g = `g-${gem.name}`;
  switch (gem.shape) {
    case 'diamond':
      return (
        <>
          <polygon points="50,12 85,50 50,88 15,50" fill={`url(#${g})`} stroke={gem.light} strokeWidth={1.5} />
          <polygon points="50,18 67,46 50,48 33,46" fill="url(#gem-hl)" opacity={0.5} />
        </>
      );
    case 'circle':
      return (
        <>
          <circle cx={50} cy={50} r={38} fill={`url(#${g})`} stroke={gem.light} strokeWidth={1.5} />
          <ellipse cx={42} cy={40} rx={17} ry={11} fill="url(#gem-hl)" opacity={0.5} />
        </>
      );
    case 'hexagon':
      return (
        <>
          <polygon points={polyPoints(6, 50, 50, 38)} fill={`url(#${g})`} stroke={gem.light} strokeWidth={1.5} />
          <ellipse cx={50} cy={38} rx={19} ry={10} fill="url(#gem-hl)" opacity={0.45} />
        </>
      );
    case 'triangle':
      return (
        <>
          <polygon points="50,12 83,69 17,69" fill={`url(#${g})`} stroke={gem.light} strokeWidth={1.5} />
          <polygon points="50,18 63,48 37,48" fill="url(#gem-hl)" opacity={0.45} />
        </>
      );
    case 'star':
      return (
        <>
          <polygon points={starPoints(50, 50, 38, 19)} fill={`url(#${g})`} stroke={gem.light} strokeWidth={1.2} />
          <ellipse cx={50} cy={40} rx={13} ry={8} fill="url(#gem-hl)" opacity={0.5} />
        </>
      );
    case 'pentagon':
      return (
        <>
          <polygon points={polyPoints(5, 50, 50, 38)} fill={`url(#${g})`} stroke={gem.light} strokeWidth={1.5} />
          <ellipse cx={50} cy={40} rx={15} ry={8} fill="url(#gem-hl)" opacity={0.45} />
        </>
      );
    case 'droplet':
      return (
        <>
          <path
            d="M50,12 Q88,31 84,65 Q77,88 50,88 Q23,88 16,65 Q12,31 50,12Z"
            fill={`url(#${g})`} stroke={gem.light} strokeWidth={1.5}
          />
          <ellipse cx={45} cy={40} rx={13} ry={10} fill="url(#gem-hl)" opacity={0.5} />
        </>
      );
    default:
      return null;
  }
}

function GemSVG({ gemId, className }: { gemId: number; className?: string }) {
  const gem = GEM_TYPES[gemId];
  if (!gem) return null;
  return (
    <svg className={className} viewBox="0 0 100 100">
      <GemShape gem={gem} />
    </svg>
  );
}

/* ══════════════════════════════════════ */
/*             HEXA GAME                 */
/* ══════════════════════════════════════ */
const REF_W = 375;
const REF_H = 667;

export default function HexaGame() {
  const navigate = useNavigate();

  /* ── 게임 상태 ── */
  const [board, setBoard] = useState<(number | null)[][]>(createEmptyBoard);
  const [phase, setPhase] = useState<GamePhase>('start');
  const [piece, setPiece] = useState<FallingPiece | null>(null);
  const [nextGems, setNextGems] = useState<[number, number, number]>(generateGems);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [, setComboCount] = useState(0);
  const [matchedCells, setMatchedCells] = useState<MatchedCell[]>([]);
  const [scale, setScale] = useState(1);

  /* refs — 콜백 안에서 최신 상태 참조 */
  const boardRef = useRef(board);
  boardRef.current = board;
  const pieceRef = useRef(piece);
  pieceRef.current = piece;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const dropInterval = getDropInterval(level);

  /* ── 스케일 ── */
  const updateScale = useCallback(() => {
    setScale(Math.min(window.innerWidth / REF_W, window.innerHeight / REF_H));
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  /* ── 레벨 업 ── */
  useEffect(() => {
    const newLevel = Math.floor(linesCleared / GEMS_PER_LEVEL) + 1;
    setLevel(newLevel);
  }, [linesCleared]);

  /* ── 피스 생성 ── */
  const spawnPiece = useCallback((gems: [number, number, number]) => {
    const spawnCol = Math.floor(COLS / 2);
    const b = boardRef.current;
    // 스폰 위치 확인 (row 0, 1)
    if (b[0][spawnCol] !== null || b[1][spawnCol] !== null) {
      setPhase('gameover');
      return;
    }
    setPiece({ col: spawnCol, row: 1, gems });
    setNextGems(generateGems());
    setComboCount(0);
    setPhase('playing');
  }, []);

  /* ── 매치 체크 & 연쇄 처리 ── */
  const processBoard = useCallback((b: (number | null)[][], combo: number) => {
    const matches = findMatches(b);
    if (matches.length > 0) {
      setMatchedCells(matches);
      setPhase('clearing');

      setTimeout(() => {
        const cleared = removeMatched(b, matches);
        const settled = applyGravity(cleared);
        setBoard(settled);
        setScore(s => s + calculateScore(matches.length, combo));
        setLinesCleared(lc => lc + matches.length);
        setMatchedCells([]);
        setPhase('cascading');

        // 연쇄 체크
        setTimeout(() => {
          const chainMatches = findMatches(settled);
          if (chainMatches.length > 0) {
            // 재귀적 연쇄 — processBoard를 직접 호출하면 settled가 stale할 수 있으므로
            // state로 관리하는 대신 직접 처리
            processBoard(settled, combo + 1);
          } else {
            // 연쇄 끝, 다음 피스
            // nextGems는 state이므로 여기서 직접 참조 불가 → spawnPiece가 최신 nextGems 사용
            setPhase('spawning' as GamePhase); // 트리거용
          }
        }, 150);
      }, 300);
    } else {
      // 매치 없음 → 다음 피스
      setPhase('spawning' as GamePhase);
    }
  }, []);

  /* ── spawning 트리거 → 실제 피스 생성 ── */
  useEffect(() => {
    if (phase === ('spawning' as GamePhase)) {
      spawnPiece(nextGems);
    }
  }, [phase, nextGems, spawnPiece]);

  /* ── 중력 틱 ── */
  useEffect(() => {
    if (phase !== 'playing' || !piece) return;

    const timer = setInterval(() => {
      const p = pieceRef.current;
      const b = boardRef.current;
      if (!p || phaseRef.current !== 'playing') return;

      if (canMoveDown(b, p)) {
        setPiece(prev => prev ? { ...prev, row: prev.row + 1 } : null);
      } else {
        // 고정
        const newBoard = lockPiece(b, p);
        setBoard(newBoard);
        setPiece(null);
        processBoard(newBoard, 0);
      }
    }, dropInterval);

    return () => clearInterval(timer);
  }, [phase, piece, dropInterval, processBoard]);

  /* ── 컨트롤 핸들러 ── */
  const handleLeft = useCallback(() => {
    if (phaseRef.current !== 'playing' || !pieceRef.current) return;
    if (canMoveSide(boardRef.current, pieceRef.current, -1)) {
      setPiece(prev => prev ? { ...prev, col: prev.col - 1 } : null);
    }
  }, []);

  const handleRight = useCallback(() => {
    if (phaseRef.current !== 'playing' || !pieceRef.current) return;
    if (canMoveSide(boardRef.current, pieceRef.current, 1)) {
      setPiece(prev => prev ? { ...prev, col: prev.col + 1 } : null);
    }
  }, []);

  const handleRotate = useCallback(() => {
    if (phaseRef.current !== 'playing' || !pieceRef.current) return;
    setPiece(prev => {
      if (!prev) return null;
      const [a, b, c] = prev.gems;
      return { ...prev, gems: [c, a, b] };
    });
  }, []);

  const handleDown = useCallback(() => {
    if (phaseRef.current !== 'playing' || !pieceRef.current) return;
    if (canMoveDown(boardRef.current, pieceRef.current)) {
      setPiece(prev => prev ? { ...prev, row: prev.row + 1 } : null);
    }
  }, []);

  const handlePause = useCallback(() => {
    if (phaseRef.current === 'playing') setPhase('paused');
    else if (phaseRef.current === 'paused') setPhase('playing');
  }, []);

  /* ── 키보드 ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': handleLeft(); break;
        case 'ArrowRight': handleRight(); break;
        case 'ArrowUp': handleRotate(); break;
        case 'ArrowDown': handleDown(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleLeft, handleRight, handleRotate, handleDown]);

  /* ── 게임 시작 / 재시작 ── */
  const handleStart = useCallback(() => {
    const b = createEmptyBoard();
    setBoard(b);
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setComboCount(0);
    setMatchedCells([]);
    const gems = generateGems();
    setNextGems(generateGems());
    boardRef.current = b;
    spawnPiece(gems);
  }, [spawnPiece]);

  /* ── 매치 셀 Set (빠른 조회용) ── */
  const matchedSet = new Set(matchedCells.map(m => `${m.row},${m.col}`));

  /* ══════════════════════════════════════ */
  /*               렌더링                   */
  /* ══════════════════════════════════════ */
  return (
    <div className="hexa-viewport">
      <GemDefs />
      <div className="hexa-page" style={{ transform: `scale(${scale})` }}>
        {/* 헤더 */}
        <div className="hexa-header">
          <PauseBtn onClick={handlePause} />
          <span className="hexa-title">HEXA</span>
          <div style={{ width: 40 }} />
        </div>

        {/* 본체 */}
        <div className="hexa-body">
          <div className="hexa-board-area">
            {/* 사이드바 */}
            <div className="hexa-sidebar">
              <div className="hexa-sidebar-top">
                <InfoPanel label="LEVEL" value={level} color="#f5c518" />
                <InfoPanel label="SCORE" value={score.toLocaleString()} />
              </div>
              <div className="hexa-panel hexa-sidebar-bottom">
                <div className="hexa-panel-label">NEXT</div>
                <div className="hexa-next-gems">
                  {nextGems.map((g, i) => (
                    <GemSVG key={i} gemId={g} className="hexa-next-gem" />
                  ))}
                </div>
              </div>
            </div>

            {/* 보드 */}
            <div className="hexa-board-wrap">
              <div className="hexa-board">
                {board.map((row, r) =>
                  row.map((gemId, c) => {
                    const pieceGem = getPieceGemAt(piece, r, c);
                    const displayGem = pieceGem ?? gemId;
                    const flashing = matchedSet.has(`${r},${c}`);
                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`hexa-cell${flashing ? ' hexa-cell-flash' : ''}`}
                      >
                        {displayGem !== null && (
                          <GemSVG gemId={displayGem} className="hexa-gem" />
                        )}
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
          </div>

          {/* 컨트롤 */}
          <div className="hexa-controls">
            <CtrlBtn dir="left" onClick={handleLeft} />
            <CtrlBtn dir="right" onClick={handleRight} />
            <CtrlBtn dir="rotate" onClick={handleRotate} />
            <CtrlBtn dir="down" onClick={handleDown} />
          </div>
        </div>

        {/* ── 오버레이 ── */}
        {phase === 'start' && (
          <div className="hexa-overlay">
            <div className="hexa-overlay-title">HEXA</div>
            <div style={{ color: '#888', fontSize: '0.8rem', fontFamily: "'Courier New',monospace" }}>
              3개를 맞추면 사라져요!
            </div>
            <button className="hexa-overlay-btn hexa-btn-play" onClick={handleStart}>
              PLAY
            </button>
          </div>
        )}

        {phase === 'paused' && (
          <div className="hexa-overlay">
            <div className="hexa-overlay-title">PAUSE</div>
            <button className="hexa-overlay-btn hexa-btn-play" onClick={handlePause}>
              계속하기
            </button>
            <button className="hexa-overlay-btn hexa-btn-exit" onClick={() => navigate('/games')}>
              나가기
            </button>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="hexa-overlay">
            <div className="hexa-overlay-title">GAME OVER</div>
            <div className="hexa-overlay-score">SCORE: {score.toLocaleString()}</div>
            <button className="hexa-overlay-btn hexa-btn-restart" onClick={handleStart}>
              다시하기
            </button>
            <button className="hexa-overlay-btn hexa-btn-exit" onClick={() => navigate('/games')}>
              나가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
