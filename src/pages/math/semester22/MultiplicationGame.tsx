import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GameShell from '../../../components/GameShell';
import type { ReactNode } from 'react';

// ─── 타입 ────────────────────────────────────────────────────────

type GameMode = 'drill' | 'solve';
type Phase =
  | 'mode-select'
  | 'dan-select'
  | 'drill-playing'
  | 'drill-result'
  | 'solve-playing';
type SelectedDan = number | 'all';

// ─── 상수 ────────────────────────────────────────────────────────

/** 교과서 권장 학습 순서 */
const DAN_ORDER = [2, 3, 4, 5, 6, 7, 8, 9, 1] as const;
const DRILL_SECONDS = 60;
const EMOJIS = ['🍎', '⭐', '🍬', '🌸', '🔴', '🍪', '🐸', '🎈'] as const;

// ─── 암기형 문제 ─────────────────────────────────────────────────

interface DrillProblem {
  a: number;
  b: number;
  answer: number;
}

function genDrillProblem(dan: SelectedDan): DrillProblem {
  const a = dan === 'all' ? Math.floor(Math.random() * 8) + 2 : dan;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a * b };
}

// ─── 배열 그림 컴포넌트 ─────────────────────────────────────────

function GroupedItems({
  groups,
  itemsPerGroup,
  emoji,
}: {
  groups: number;
  itemsPerGroup: number;
  emoji: string;
}) {
  return (
    <div className="mg-groups-wrap">
      {Array.from({ length: groups }, (_, g) => (
        <div key={g} className="mg-group-box">
          {Array.from({ length: itemsPerGroup }, (_, i) => (
            <span key={i} className="mg-item-emoji">
              {emoji}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── 풀이형 문제 생성 ────────────────────────────────────────────

interface SolveProblem {
  display: ReactNode;
  answer: number;
  choices?: string[];
}

function pickDan(dan: SelectedDan): number {
  return dan === 'all' ? Math.floor(Math.random() * 8) + 2 : dan;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** B1: 빈칸 채우기 (□ × b = ans 또는 a × □ = ans) */
function genBlankFill(dan: SelectedDan): SolveProblem {
  const a = pickDan(dan);
  const b = rand(1, 9);
  const ans = a * b;
  const blankIsA = Math.random() < 0.5;

  return {
    display: (
      <div className="mg-eq-row">
        {blankIsA ? (
          <span className="mg-eq-blank">□</span>
        ) : (
          <span className="mg-eq-num">{a}</span>
        )}
        <span className="mg-eq-op">×</span>
        {blankIsA ? (
          <span className="mg-eq-num">{b}</span>
        ) : (
          <span className="mg-eq-blank">□</span>
        )}
        <span className="mg-eq-op">=</span>
        <span className="mg-eq-result">{ans}</span>
      </div>
    ),
    answer: blankIsA ? a : b,
  };
}

/** B2: 배열 그림 보고 총 개수 맞추기 */
function genPictureProblem(dan: SelectedDan): SolveProblem {
  const a = Math.min(pickDan(dan), 5); // 최대 5묶음 (그림이 너무 많아지지 않도록)
  const b = Math.min(rand(2, 9), 7);   // 묶음당 최대 7개
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  return {
    display: (
      <div className="mg-picture-problem">
        <GroupedItems groups={a} itemsPerGroup={b} emoji={emoji} />
        <p className="mg-picture-q">
          <strong>{a}묶음</strong>씩 <strong>{b}개</strong>인 {emoji}는 모두 몇 개인가요?
        </p>
      </div>
    ),
    answer: a * b,
  };
}

/** B3: 크기 비교 (choices 모드 — answer = 정답의 0-based 인덱스) */
function genCompare(dan: SelectedDan): SolveProblem {
  const a = pickDan(dan);
  const b = rand(1, 9);
  const c = pickDan(dan === 'all' ? 'all' : dan);
  const d = rand(1, 9);
  const left = a * b;
  const right = c * d;

  let ansIdx: number;
  if (left > right) ansIdx = 0;       // '>'
  else if (left < right) ansIdx = 1;  // '<'
  else ansIdx = 2;                    // '='

  return {
    display: (
      <div className="mg-compare-wrap">
        <div className="mg-compare-row">
          <span className="mg-compare-side">{a} × {b}</span>
          <span className="mg-compare-circle">○</span>
          <span className="mg-compare-side">{c} × {d}</span>
        </div>
        <p className="mg-compare-hint">○ 안에 &gt;, &lt;, = 중 알맞은 것을 골라요</p>
      </div>
    ),
    answer: ansIdx,
    choices: ['>', '<', '='],
  };
}

/** B4: 서술형 문장제 */
function genWordProblem(dan: SelectedDan): SolveProblem {
  const a = pickDan(dan);
  const b = rand(2, 9);

  const templates = [
    { unit: '봉지', item: '사탕', verb: '들어' },
    { unit: '줄', item: '구슬', verb: '있' },
    { unit: '접시', item: '과자', verb: '있' },
    { unit: '상자', item: '사과', verb: '들어' },
    { unit: '바구니', item: '딸기', verb: '있' },
  ];
  const t = templates[Math.floor(Math.random() * templates.length)];

  return {
    display: (
      <div className="mg-word-problem">
        <p className="mg-word-text">
          한 {t.unit}에 {t.item}이{' '}
          <strong className="mg-highlight">{a}개</strong>씩 {t.verb}있습니다.
        </p>
        <p className="mg-word-text">
          <strong className="mg-highlight">{b}{t.unit}</strong>에는{' '}
          {t.item}이 모두 몇 개인가요?
        </p>
      </div>
    ),
    answer: a * b,
  };
}

function createSolveProblem(dan: SelectedDan): SolveProblem {
  const pick = Math.floor(Math.random() * 4);
  switch (pick) {
    case 0:  return genBlankFill(dan);
    case 1:  return genPictureProblem(dan);
    case 2:  return genCompare(dan);
    default: return genWordProblem(dan);
  }
}

// ─── 모드 선택 화면 ───────────────────────────────────────────────

function ModeSelectScreen({
  onSelect,
  onBack,
}: {
  onSelect: (mode: GameMode) => void;
  onBack: () => void;
}) {
  return (
    <div className="mg-page">
      <button className="back-btn" onClick={onBack}>← 뒤로</button>
      <div className="mg-header-area">
        <div className="mg-icon-big">✖️</div>
        <h1 className="mg-title">곱셈구구</h1>
        <p className="mg-subtitle">2학년 2학기 2단원</p>
      </div>
      <div className="mg-mode-grid">
        <button className="mg-mode-btn mg-mode-drill" onClick={() => onSelect('drill')}>
          <span className="mg-mode-emoji">🏃</span>
          <span className="mg-mode-label">암기 연습</span>
          <span className="mg-mode-desc">
            타이머+콤보로<br />빠르게 외우기!
          </span>
        </button>
        <button className="mg-mode-btn mg-mode-solve" onClick={() => onSelect('solve')}>
          <span className="mg-mode-emoji">🔍</span>
          <span className="mg-mode-label">풀이 연습</span>
          <span className="mg-mode-desc">
            그림·빈칸·문장으로<br />개념 이해!
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── 단 선택 화면 ────────────────────────────────────────────────

function DanSelector({
  mode,
  onSelect,
  onBack,
}: {
  mode: GameMode;
  onSelect: (dan: SelectedDan) => void;
  onBack: () => void;
}) {
  return (
    <div className="mg-page">
      <button className="back-btn" onClick={onBack}>← 뒤로</button>
      <div className="mg-header-area">
        <div className="mg-icon-big">{mode === 'drill' ? '🏃' : '🔍'}</div>
        <h1 className="mg-title">{mode === 'drill' ? '암기 연습' : '풀이 연습'}</h1>
        <p className="mg-subtitle">연습할 단을 골라요!</p>
      </div>
      <div className="mg-dan-grid">
        {DAN_ORDER.map((dan) => (
          <button key={dan} className="mg-dan-btn" onClick={() => onSelect(dan)}>
            <span className="mg-dan-num">{dan}</span>
            <span className="mg-dan-unit">단</span>
          </button>
        ))}
      </div>
      <button className="mg-all-btn" onClick={() => onSelect('all')}>
        🚀 전체 랜덤 도전!
      </button>
    </div>
  );
}

// ─── 암기형 게임 ─────────────────────────────────────────────────

function DrillMode({
  dan,
  onBack,
  onFinish,
}: {
  dan: SelectedDan;
  onBack: () => void;
  onFinish: (score: number, correct: number, maxCombo: number) => void;
}) {
  const [timeLeft, setTimeLeft] = useState(DRILL_SECONDS);
  const [problem, setProblem] = useState<DrillProblem>(() => genDrillProblem(dan));
  const [input, setInput] = useState('');
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAnim, setWrongAnim] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);

  // ref로 최신 상태 & 콜백 유지 (stale closure 방지)
  const doneRef = useRef(false);
  const latestRef = useRef({ score: 0, correctCount: 0, maxCombo: 0 });
  latestRef.current = { score, correctCount, maxCombo };
  const onFinishRef = useRef(onFinish);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  // 1초 타이머
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // 타이머 종료 → 결과 화면 전환
  useEffect(() => {
    if (timeLeft === 0 && !doneRef.current) {
      doneRef.current = true;
      const { score: s, correctCount: c, maxCombo: m } = latestRef.current;
      setTimeout(() => onFinishRef.current(s, c, m), 400);
    }
  }, [timeLeft]);

  // 숫자패드 키 처리
  function handleKey(key: string) {
    if (wrongAnim) return;

    if (key === '←') {
      setInput((p) => p.slice(0, -1));
      return;
    }

    if (key === '✓') {
      if (!input) return;
      const val = parseInt(input, 10);

      if (val === problem.answer) {
        const nc = combo + 1;
        setCombo(nc);
        setScore((s) => s + 10 + nc * 2);
        setCorrectCount((c) => c + 1);
        setMaxCombo((m) => Math.max(m, nc));
        setProblem(genDrillProblem(dan));
        setInput('');
      } else {
        setCombo(0);
        setWrongAnswer(problem.answer);
        setWrongAnim(true);
        setInput('');
        setTimeout(() => {
          setProblem(genDrillProblem(dan));
          setWrongAnim(false);
          setWrongAnswer(null);
        }, 800);
      }
      return;
    }

    // 숫자 입력 (최대 2자리: 9×9=81)
    setInput((p) => (p.length >= 2 ? p : p + key));
  }

  const timerPct = (timeLeft / DRILL_SECONDS) * 100;
  const isDanger = timeLeft <= 10;
  const comboIcon = combo >= 5 ? '⚡' : combo >= 3 ? '🔥' : '✨';

  return (
    <div className="mg-drill-page">
      {/* 헤더 */}
      <div className="mg-drill-header">
        <button className="back-btn mg-drill-back" onClick={onBack}>
          ← 뒤로
        </button>
        <span className="mg-drill-title">✖️ 곱셈구구</span>
        <span className="mg-drill-score">⭐ {score}점</span>
      </div>

      {/* 타이머 바 */}
      <div className="mg-timer-bar-wrap">
        <div
          className={`mg-timer-bar-fill${isDanger ? ' danger' : ''}`}
          style={{ width: `${timerPct}%` }}
        />
        <span className={`mg-timer-text${isDanger ? ' danger' : ''}`}>
          {timeLeft}초
        </span>
      </div>

      {/* 게임 본체 */}
      <div className="mg-drill-body">
        {/* 콤보 표시 */}
        <div className={`mg-combo${combo >= 3 ? ' big' : ''}`}>
          {combo >= 1 ? `${comboIcon} ${combo}콤보!` : '\u00A0'}
        </div>

        {/* 단 배지 */}
        <div className="mg-dan-badge">
          {dan === 'all' ? `${problem.a}단` : `${dan}단`}
        </div>

        {/* 수식 */}
        <div className={`mg-drill-eq-wrap${wrongAnim ? ' wrong' : ''}`}>
          <span className="mg-deq-num">{problem.a}</span>
          <span className="mg-deq-op">×</span>
          <span className="mg-deq-num">{problem.b}</span>
          <span className="mg-deq-op">=</span>
          <span className={`mg-deq-ans${wrongAnim ? ' wrong' : ''}`}>
            {wrongAnim ? wrongAnswer : (input || '?')}
          </span>
        </div>
      </div>

      {/* 숫자패드 */}
      <div className="mg-numpad-area">
        <div className="numpad">
          {(['1','2','3','4','5','6','7','8','9','←','0','✓'] as const).map((k) => (
            <button
              key={k}
              className={`numpad-btn${k === '✓' ? ' btn-submit' : ''}${k === '←' ? ' btn-back' : ''}`}
              onClick={() => handleKey(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 암기형 결과 화면 ────────────────────────────────────────────

function DrillResult({
  score,
  correct,
  maxCombo,
  dan,
  onRetry,
  onBack,
}: {
  score: number;
  correct: number;
  maxCombo: number;
  dan: SelectedDan;
  onRetry: () => void;
  onBack: () => void;
}) {
  const rating =
    correct >= 40 ? '🏆' :
    correct >= 25 ? '⭐' :
    correct >= 10 ? '🌟' : '💪';

  const danLabel = dan === 'all' ? '전체 랜덤' : `${dan}단`;

  return (
    <div className="mg-page">
      <button className="back-btn" onClick={onBack}>← 뒤로</button>
      <div className="mg-result-card">
        <div className="mg-result-rating">{rating}</div>
        <h2 className="mg-result-title">{danLabel} 완료!</h2>
        <div className="mg-result-stats">
          <div className="mg-stat">
            <span className="mg-stat-ico">⭐</span>
            <span className="mg-stat-val">{score}점</span>
            <span className="mg-stat-lbl">총 점수</span>
          </div>
          <div className="mg-stat">
            <span className="mg-stat-ico">✅</span>
            <span className="mg-stat-val">{correct}개</span>
            <span className="mg-stat-lbl">정답</span>
          </div>
          <div className="mg-stat">
            <span className="mg-stat-ico">🔥</span>
            <span className="mg-stat-val">{maxCombo}콤보</span>
            <span className="mg-stat-lbl">최고 콤보</span>
          </div>
        </div>
        <button className="mg-retry-btn" onClick={onRetry}>
          다시 도전! 🚀
        </button>
        <button className="mg-back-link" onClick={onBack}>
          단 선택으로
        </button>
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────

export default function MultiplicationGame() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlMode = searchParams.get('mode') as GameMode | null;

  const [gameMode, setGameMode] = useState<GameMode>(urlMode ?? 'drill');
  const [phase, setPhase] = useState<Phase>(() =>
    urlMode === 'drill' || urlMode === 'solve' ? 'dan-select' : 'mode-select',
  );
  const [selectedDan, setSelectedDan] = useState<SelectedDan>('all');

  // 드릴 결과 저장
  const [drillResult, setDrillResult] = useState({ score: 0, correct: 0, maxCombo: 0 });

  // 재마운트 키 (재도전 시 상태 초기화)
  const [drillKey, setDrillKey] = useState(0);
  const [solveKey, setSolveKey] = useState(0);

  const handleModeSelect = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setSearchParams({ mode });
    setPhase('dan-select');
  }, [setSearchParams]);

  const handleDanSelect = useCallback((dan: SelectedDan) => {
    setSelectedDan(dan);
    if (gameMode === 'drill') {
      setDrillKey((k) => k + 1);
      setPhase('drill-playing');
    } else {
      setSolveKey((k) => k + 1);
      setPhase('solve-playing');
    }
  }, [gameMode]);

  const handleDrillFinish = useCallback((score: number, correct: number, maxCombo: number) => {
    setDrillResult({ score, correct, maxCombo });
    setPhase('drill-result');
  }, []);

  const handleBackFromDanSelect = useCallback(() => {
    if (urlMode) {
      // URL 파라미터로 직접 진입한 경우 → semester22 페이지로
      navigate('/math/semester22');
    } else {
      setSearchParams({});
      setPhase('mode-select');
    }
  }, [urlMode, navigate, setSearchParams]);

  const handleBackFromGame = useCallback(() => {
    setPhase('dan-select');
  }, []);

  // 풀이형 generate 함수 (선택된 단 반영)
  const generateSolve = useCallback((): SolveProblem => {
    return createSolveProblem(selectedDan);
  }, [selectedDan]);

  // ── 렌더 ──────────────────────────────────────────────────────

  if (phase === 'mode-select') {
    return (
      <ModeSelectScreen
        onSelect={handleModeSelect}
        onBack={() => navigate('/math/semester22')}
      />
    );
  }

  if (phase === 'dan-select') {
    return (
      <DanSelector
        mode={gameMode}
        onSelect={handleDanSelect}
        onBack={handleBackFromDanSelect}
      />
    );
  }

  if (phase === 'drill-playing') {
    return (
      <DrillMode
        key={drillKey}
        dan={selectedDan}
        onBack={handleBackFromGame}
        onFinish={handleDrillFinish}
      />
    );
  }

  if (phase === 'drill-result') {
    return (
      <DrillResult
        score={drillResult.score}
        correct={drillResult.correct}
        maxCombo={drillResult.maxCombo}
        dan={selectedDan}
        onRetry={() => {
          setDrillKey((k) => k + 1);
          setPhase('drill-playing');
        }}
        onBack={handleBackFromGame}
      />
    );
  }

  if (phase === 'solve-playing') {
    const danLabel = selectedDan === 'all' ? '전체' : `${selectedDan}단`;
    return (
      <GameShell
        key={solveKey}
        title={`✖️ 곱셈구구 풀기 (${danLabel})`}
        backTo="/math/semester22/unit2?mode=solve"
        generate={generateSolve}
        maxDigits={2}
      />
    );
  }

  return null;
}
