import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── 타입 ── */
type Mode = 'addition' | 'subtraction';

interface Problem {
  a: number;
  b: number;
  answer: number;
  vertical: boolean;
  /* 풀이 빈칸 채우기 */
  steps?: number[];
  stepLines?: string[];
  /** 오답 시 표시할 힌트 메시지 */
  hint?: string;
}

/* ── 풀이 빈칸 패턴 생성 ── */
type StepPattern = { steps: number[]; stepLines: string[] };

function makeStepAddition(a: number, b: number): StepPattern | null {
  const ans = a + b;
  const pool: StepPattern[] = [];
  // a를 올림 (a%10 >= 7 → diff 1~3)
  if (a % 10 >= 7) {
    const k = 10 - (a % 10), r = a + k, m = r + b;
    pool.push(
      { stepLines: [`${a} + ${b}`, `= ${r} + {0} − ${k}`, `= {1} − ${k}`, `= {2}`], steps: [b, m, ans] },
      { stepLines: [`${a} + ${b}`, `= {0} + ${b} − ${k}`, `= {1} − ${k}`, `= {2}`], steps: [r, m, ans] },
      { stepLines: [`${a} + ${b}`, `= ${r} + ${b} − {0}`, `= {1} − ${k}`, `= {2}`], steps: [k, m, ans] },
    );
  }
  // a를 내림 (a%10 in 1~3 → diff 1~3)
  if (a % 10 >= 1 && a % 10 <= 3) {
    const k = a % 10, r = a - k, m = r + b;
    pool.push(
      { stepLines: [`${a} + ${b}`, `= ${r} + {0} + ${k}`, `= {1} + ${k}`, `= {2}`], steps: [b, m, ans] },
      { stepLines: [`${a} + ${b}`, `= {0} + ${b} + ${k}`, `= {1} + ${k}`, `= {2}`], steps: [r, m, ans] },
    );
  }
  // b를 올림 (b%10 >= 7)
  if (b % 10 >= 7) {
    const k = 10 - (b % 10), r = b + k, m = a + r;
    pool.push(
      { stepLines: [`${a} + ${b}`, `= ${a} + {0} − ${k}`, `= {1} − ${k}`, `= {2}`], steps: [r, m, ans] },
    );
  }
  // b를 내림 (b%10 in 1~3)
  if (b % 10 >= 1 && b % 10 <= 3) {
    const k = b % 10, r = b - k, m = a + r;
    pool.push(
      { stepLines: [`${a} + ${b}`, `= ${a} + {0} + ${k}`, `= {1} + ${k}`, `= {2}`], steps: [r, m, ans] },
    );
  }
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

function makeStepSubtraction(a: number, b: number): StepPattern | null {
  const ans = a - b;
  const pool: StepPattern[] = [];
  // a를 내림 (a%10 in 1~3)
  if (a % 10 >= 1 && a % 10 <= 3) {
    const k = a % 10, r = a - k, m = r - b;
    pool.push(
      { stepLines: [`${a} − ${b}`, `= ${r} − {0} + ${k}`, `= {1} + ${k}`, `= {2}`], steps: [b, m, ans] },
      { stepLines: [`${a} − ${b}`, `= {0} − ${b} + ${k}`, `= {1} + ${k}`, `= {2}`], steps: [r, m, ans] },
    );
  }
  // a를 올림 (a%10 >= 7)
  if (a % 10 >= 7) {
    const k = 10 - (a % 10), r = a + k, m = r - b;
    pool.push(
      { stepLines: [`${a} − ${b}`, `= ${r} − {0} − ${k}`, `= {1} − ${k}`, `= {2}`], steps: [b, m, ans] },
      { stepLines: [`${a} − ${b}`, `= {0} − ${b} − ${k}`, `= {1} − ${k}`, `= {2}`], steps: [r, m, ans] },
    );
  }
  // b를 올림 (b%10 >= 7, a >= r 필요)
  if (b % 10 >= 7) {
    const k = 10 - (b % 10), r = b + k;
    if (a >= r) {
      const m = a - r;
      pool.push(
        { stepLines: [`${a} − ${b}`, `= ${a} − {0} + ${k}`, `= {1} + ${k}`, `= {2}`], steps: [r, m, ans] },
      );
    }
  }
  // b를 내림 (b%10 in 1~3)
  if (b % 10 >= 1 && b % 10 <= 3) {
    const k = b % 10, r = b - k, m = a - r;
    pool.push(
      { stepLines: [`${a} − ${b}`, `= ${a} − {0} − ${k}`, `= {1} − ${k}`, `= {2}`], steps: [r, m, ans] },
    );
  }
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
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
      // 풀이 빈칸: 40% 확률 (조건 충족 시)
      if (Math.random() < 0.4) {
        const step = makeStepAddition(a, b);
        if (step) return {
          a, b, answer: a + b, vertical: false, ...step,
          hint: '앞의 식 패턴을 따라 빈칸에 알맞은 수를 찾아봐요! 한 단계씩 천천히 계산해요.',
        };
      }
      const vertical = Math.random() < 0.5;
      return {
        a, b, answer: a + b, vertical,
        hint: vertical
          ? '일의 자리끼리 더해서 10 이상이면, 10은 십의 자리로 올려요! (받아올림)'
          : '일의 자리를 먼저 더해봐요. 10이 넘으면 받아올림을 해요!',
      };
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
      // 풀이 빈칸: 40% 확률 (조건 충족 시)
      if (Math.random() < 0.4) {
        const step = makeStepSubtraction(a, b);
        if (step) return {
          a, b, answer: a - b, vertical: false, ...step,
          hint: '앞의 식 패턴을 따라 빈칸에 알맞은 수를 찾아봐요! 한 단계씩 천천히 계산해요.',
        };
      }
      const vertical = Math.random() < 0.5;
      return {
        a, b, answer: a - b, vertical,
        hint: vertical
          ? '일의 자리에서 뺄 수 없으면, 십의 자리에서 10을 빌려와요! (받아내림)'
          : '일의 자리끼리 빼기 어려우면 십의 자리에서 10을 빌려와요!',
      };
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
  const [stepIdx, setStepIdx] = useState(0);
  const [filledSteps, setFilledSteps] = useState<number[]>([]);

  /* mode 변경 시 리셋 */
  useEffect(() => {
    setProblem(make());
    setScore(0);
    setInput('');
    setStepIdx(0);
    setFilledSteps([]);
    setResult({ show: false, correct: false });
  }, [mode]);

  /* refs */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  /* ── 캔버스 크기 (낙서 보존) ── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const cont = containerRef.current;
    if (!canvas || !cont) return;
    const newW = cont.clientWidth;
    const newH = cont.clientHeight;
    if (newW <= 0 || newH <= 0) return;          // 가로모드 등 숨겨진 상태 → 무시
    if (canvas.width === newW && canvas.height === newH) return;
    // 기존 그림 저장
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    tmp.getContext('2d')!.drawImage(canvas, 0, 0);
    // 리사이즈 + 복원
    canvas.width = newW;
    canvas.height = newH;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f9f7f0';
    ctx.fillRect(0, 0, newW, newH);
    ctx.drawImage(tmp, 0, 0);
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

    if (problem.steps) {
      const correct = num === problem.steps[stepIdx];
      if (correct) {
        const next = [...filledSteps, num];
        setFilledSteps(next);
        setInput('');
        if (next.length === problem.steps.length) {
          setScore((s) => s + 1);
          setResult({ show: true, correct: true });
          launchConfetti(containerRef.current);
        } else {
          setStepIdx((s) => s + 1);
        }
      } else {
        setResult({ show: true, correct: false });
        const delay = problem.hint ? 2500 : 1500;
        setTimeout(() => {
          setResult({ show: false, correct: false });
          setInput('');
        }, delay);
      }
      return;
    }

    const correct = num === problem.answer;
    if (correct) {
      setScore((s) => s + 1);
      setResult({ show: true, correct: true });
      launchConfetti(containerRef.current);
    } else {
      setResult({ show: true, correct: false });
      const delay = problem.hint ? 2500 : 1500;
      setTimeout(() => {
        setResult({ show: false, correct: false });
        setInput('');
        clearCanvas();
      }, delay);
    }
  }, [input, problem, stepIdx, filledSteps, clearCanvas]);

  /* ── 다음 문제 ── */
  const nextProblem = useCallback(() => {
    setProblem(make());
    setInput('');
    setStepIdx(0);
    setFilledSteps([]);
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
          {problem.steps ? (
            <StepDisplay problem={problem} filledSteps={filledSteps} currentStep={stepIdx} />
          ) : (
            <ProblemDisplay problem={problem} op={op} />
          )}
        </div>

      </div>

      {/* 정답 표시 */}
      <div className="answer-display">
        <div className="ans-inner">
          <span className="ans-label">{problem.steps ? `빈칸 ${stepIdx + 1}/${problem.steps.length}` : '정답'}</span>
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
            {!result.correct && problem.hint && (
              <div className="hint-box">
                <span className="hint-icon">💡</span>
                <p className="hint-text">{problem.hint}</p>
              </div>
            )}
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

/* ── 풀이 빈칸 표시 ── */
function StepDisplay({ problem, filledSteps, currentStep }: {
  problem: Problem; filledSteps: number[]; currentStep: number;
}) {
  if (!problem.stepLines || !problem.steps) return null;

  const blank = (idx: number) => {
    if (idx < filledSteps.length)
      return <span className="step-filled">{filledSteps[idx]}</span>;
    if (idx === currentStep)
      return <span className="step-blank active">?</span>;
    return <span className="step-blank">□</span>;
  };

  return (
    <div className="step-display">
      {problem.stepLines.map((line, li) => (
        <div key={li} className={`step-line${li === 0 ? ' step-first' : ''}`}>
          {line.split(/(\{\d+\})/).map((part, pi) => {
            const m = part.match(/^\{(\d+)\}$/);
            return <span key={pi}>{m ? blank(parseInt(m[1])) : part}</span>;
          })}
        </div>
      ))}
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
