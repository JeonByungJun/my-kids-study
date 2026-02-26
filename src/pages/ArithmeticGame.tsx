import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── 타입 ── */
type Mode = 'addition' | 'subtraction';

interface Problem {
  a: number;
  b: number;
  answer: number;
  vertical: boolean;
}

const CONFIG: Record<Mode, { title: string; op: string; make: () => Problem }> = {
  addition: {
    title: '받아올림 덧셈',
    op: '+',
    make() {
      // 일의 자리 합이 10 이상 → 받아올림 보장
      let a: number, b: number;
      do {
        a = Math.floor(Math.random() * 90) + 10;
        b = Math.floor(Math.random() * 90) + 10;
      } while ((a % 10) + (b % 10) < 10);
      return { a, b, answer: a + b, vertical: Math.random() < 0.5 };
    },
  },
  subtraction: {
    title: '받아내림 뺄셈',
    op: '−',
    make() {
      // 일의 자리: a < b → 받아내림 보장
      let a: number, b: number;
      do {
        a = Math.floor(Math.random() * 90) + 10;
        b = Math.floor(Math.random() * 90) + 10;
        if (a < b) [a, b] = [b, a];
      } while ((a % 10) >= (b % 10));
      return { a, b, answer: a - b, vertical: Math.random() < 0.5 };
    },
  },
};

/* ════════════════════════════════════════ */
export default function ArithmeticGame({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { title, op, make } = CONFIG[mode];

  /* 상태 */
  const [problem, setProblem] = useState<Problem>(() => make());
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{
    show: boolean;
    correct: boolean;
  }>({ show: false, correct: false });

  /* mode 변경 시 리셋 */
  useEffect(() => {
    setProblem(make());
    setScore(0);
    setInput('');
    setResult({ show: false, correct: false });
  }, [mode]);

  /* refs */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  /* ── 캔버스 크기 ── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const cont = containerRef.current;
    if (!canvas || !cont) return;
    canvas.width = cont.clientWidth;
    canvas.height = cont.clientHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f9f7f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  /* ── 그리기 ── */
  const getXY = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height),
    };
  }, []);

  const penSize = useCallback(() => {
    const canvas = canvasRef.current;
    return canvas ? Math.max(canvas.width * 0.012, 5) : 5;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      drawingRef.current = true;
      canvasRef.current?.setPointerCapture(e.pointerId);
      const { x, y } = getXY(e);
      lastPosRef.current = { x, y };
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(x, y, penSize() / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#1a202c';
      ctx.fill();
    },
    [getXY, penSize],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drawingRef.current) return;
      e.preventDefault();
      const { x, y } = getXY(e);
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#1a202c';
      ctx.lineWidth = penSize();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      lastPosRef.current = { x, y };
    },
    [getXY, penSize],
  );

  const onPointerUp = useCallback(() => {
    drawingRef.current = false;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f9f7f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  /* ── 숫자패드 입력 ── */
  const onDigit = useCallback((d: string) => {
    setInput((prev) => {
      if (prev.length >= 3) return prev;
      return prev + d;
    });
  }, []);

  const onBackspace = useCallback(() => {
    setInput((prev) => prev.slice(0, -1));
  }, []);

  /* ── 정답 확인 ── */
  const checkAnswer = useCallback(() => {
    if (!input) return;
    const num = parseInt(input, 10);
    const correct = num === problem.answer;
    if (correct) {
      setScore((s) => s + 1);
      setResult({ show: true, correct: true });
      launchConfetti(containerRef.current);
    } else {
      setResult({ show: true, correct: false });
      setTimeout(() => {
        setResult({ show: false, correct: false });
        setInput('');
        clearCanvas();
      }, 1500);
    }
  }, [input, problem, clearCanvas]);

  /* ── 다음 문제 ── */
  const nextProblem = useCallback(() => {
    setProblem(make());
    setInput('');
    setResult({ show: false, correct: false });
    setTimeout(clearCanvas, 0);
  }, [clearCanvas, make]);

  /* ═══ 렌더 ═══ */
  return (
    <div className="game-page">
      {/* 헤더 */}
      <div className="game-header">
        <button className="back-btn" onClick={() => navigate('/math/calc')}>
          ← 뒤로
        </button>
        <span className="title">{title}</span>
        <span className="score">✓ {score}</span>
      </div>

      {/* 캔버스 영역 (풀이용) */}
      <div className="canvas-container" ref={containerRef}>
        <canvas
          className="game-canvas"
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />

        {/* 문제 */}
        <div className="problem-overlay">
          <ProblemDisplay problem={problem} op={op} />
        </div>

      </div>

      {/* 정답 표시 */}
      <div className="answer-display">
        <div className="ans-inner">
          <span className="ans-label">정답</span>
          <span className="ans-value">{input || '?'}</span>
        </div>
      </div>

      {/* 하단 입력 영역 */}
      <div className="input-area">
        {/* 숫자패드 + 지우기 */}
        <div className="numpad-area">
          <button className="numpad-side btn-clear" onClick={clearCanvas}>🗑️</button>
          <div className="numpad">
            {['1','2','3','4','5','6','7','8','9','←','0','✓'].map((key) => (
              <button
                key={key}
                className={`numpad-btn ${key === '✓' ? 'btn-submit' : ''} ${key === '←' ? 'btn-back' : ''}`}
                onClick={() => {
                  if (key === '←') onBackspace();
                  else if (key === '✓') checkAnswer();
                  else onDigit(key);
                }}
              >
                {key}
              </button>
            ))}
          </div>
          <button className="numpad-side btn-clear" onClick={() => setInput('')}>CE</button>
        </div>
      </div>

      {/* 결과 오버레이 (최상위) */}
      {result.show && (
        <div className="result-overlay">
          <div className={`result-card ${result.correct ? 'result-correct' : 'result-wrong'}`}>
            <div className="result-emoji">
              {result.correct
                ? ['🎉', '⭐', '🌟', '🏆', '🎊'][Math.floor(Math.random() * 5)]
                : ['😅', '🤔', '💪', '😊'][Math.floor(Math.random() * 4)]}
            </div>
            <div className="result-text">
              {result.correct ? '정답이에요!' : '다시 해봐요!'}
            </div>
            <div className="result-sub">
              {result.correct
                ? `${problem.a} ${op} ${problem.b} = ${problem.answer}`
                : `${input}은(는) 아니에요!`}
            </div>
          </div>
          {result.correct && (
            <button className="result-next-btn" onClick={nextProblem}>
              다음 문제 ▶
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── 문제 표시 ── */
function ProblemDisplay({ problem, op }: { problem: Problem; op: string }) {
  if (problem.vertical) {
    return (
      <div className="problem-vertical">
        <div style={{ textAlign: 'right' }}>{problem.a}</div>
        <div className="op-row">
          <span>{op}</span>
          <span className="num">{problem.b}</span>
        </div>
        <div className="div-line" />
      </div>
    );
  }
  return (
    <div className="problem-horizontal">
      {problem.a} {op} {problem.b} = <span className="q-mark">?</span>
    </div>
  );
}

/* ── 컨페티 ── */
function launchConfetti(cont: HTMLDivElement | null) {
  if (!cont) return;
  const colors = ['#f6e05e', '#68d391', '#63b3ed', '#fc8181', '#b794f4', '#f687b3'];
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div');
    const c = colors[Math.floor(Math.random() * colors.length)];
    const sz = Math.random() * 14 + 5;
    el.style.cssText =
      `position:absolute;width:${sz}px;height:${sz}px;background:${c};` +
      `border-radius:${Math.random() > 0.5 ? '50%' : '3px'};` +
      `left:${Math.random() * 100}%;top:-20px;z-index:35;pointer-events:none;` +
      `animation:cf-fall ${Math.random() * 1.5 + 1}s ease-in forwards;` +
      `animation-delay:${Math.random() * 0.6}s;`;
    cont.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}
