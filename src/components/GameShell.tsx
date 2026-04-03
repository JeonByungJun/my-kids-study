import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Problem {
  display: ReactNode;
  answer: number;
  /** 선택지 모드: 제공 시 숫자패드 대신 선택 버튼 표시. answer = 정답의 0-based 인덱스 */
  choices?: string[];
  /** 다중선택 모드: 여러 개 골라 확인. multiAnswer = 정답 인덱스 배열 */
  multiChoices?: string[];
  multiAnswer?: number[];
  /** 오답 시 표시할 힌트 메시지 */
  hint?: string;
}

interface GameShellProps {
  title: string;
  backTo: string;
  generate: () => Problem;
  maxDigits?: number;
}

export default function GameShell({ title, backTo, generate, maxDigits = 3 }: GameShellProps) {
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem>(() => generate());
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<{ show: boolean; correct: boolean }>({
    show: false,
    correct: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

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

  const onDigit = useCallback(
    (d: string) => {
      setInput((prev) => {
        if (prev.length >= maxDigits) return prev;
        return prev + d;
      });
    },
    [maxDigits],
  );

  const onBackspace = useCallback(() => {
    setInput((prev) => prev.slice(0, -1));
  }, []);

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
      const delay = problem.hint ? 2500 : 1500;
      setTimeout(() => {
        setResult({ show: false, correct: false });
        setInput('');
        clearCanvas();
      }, delay);
    }
  }, [input, problem, clearCanvas]);

  /* 다중선택 토글 */
  const onMultiToggle = useCallback((idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  /* 다중선택 확인 */
  const checkMultiAnswer = useCallback(() => {
    if (selected.size === 0) return;
    const sorted = [...selected].sort((a, b) => a - b);
    const ans = [...(problem.multiAnswer ?? [])].sort((a, b) => a - b);
    const correct = sorted.length === ans.length && sorted.every((v, i) => v === ans[i]);
    if (correct) {
      setScore(s => s + 1);
      setResult({ show: true, correct: true });
      launchConfetti(containerRef.current);
    } else {
      setResult({ show: true, correct: false });
      const delay = problem.hint ? 2500 : 1500;
      setTimeout(() => {
        setResult({ show: false, correct: false });
        setSelected(new Set());
        clearCanvas();
      }, delay);
    }
  }, [selected, problem, clearCanvas]);

  /* 선택지 클릭 */
  const onChoice = useCallback(
    (idx: number) => {
      const correct = idx === problem.answer;
      setInput(problem.choices?.[idx] ?? '');
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
    },
    [problem, clearCanvas],
  );

  const nextProblem = useCallback(() => {
    setProblem(generate());
    setInput('');
    setSelected(new Set());
    setResult({ show: false, correct: false });
    setTimeout(clearCanvas, 0);
  }, [clearCanvas, generate]);

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="back-btn" onClick={() => navigate(backTo)}>
          ← 뒤로
        </button>
        <span className="title">{title}</span>
        <span className="score">✓ {score}</span>
      </div>

      <div className="canvas-container" ref={containerRef}>
        <canvas
          className="game-canvas"
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        <div className="problem-overlay">{problem.display}</div>
      </div>

      {/* 다중선택 vs 선택지 vs 숫자패드 */}
      {problem.multiChoices ? (
        <div className="input-area">
          <div className="multi-choice-area">
            {problem.multiChoices.map((text, i) => (
              <button
                key={i}
                className={`multi-choice-btn ${selected.has(i) ? 'selected' : ''}`}
                onClick={() => onMultiToggle(i)}
              >
                {text}
              </button>
            ))}
          </div>
          <button className="multi-submit-btn" onClick={checkMultiAnswer}>
            확인 ✓
          </button>
        </div>
      ) : problem.choices ? (
        <div className="input-area">
          <div className="choice-area">
            {problem.choices.map((text, i) => (
              <button key={i} className="choice-btn" onClick={() => onChoice(i)}>
                {text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="answer-display">
            <div className="ans-inner">
              <span className="ans-label">정답</span>
              <span className="ans-value">{input || '?'}</span>
            </div>
          </div>

          <div className="input-area">
            <div className="numpad-area">
              <button className="numpad-side btn-clear" onClick={clearCanvas}>
                🗑️
              </button>
              <div className="numpad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '✓'].map((key) => (
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
              <button className="numpad-side btn-clear" onClick={() => setInput('')}>
                CE
              </button>
            </div>
          </div>
        </>
      )}

      {result.show && (
        <div className="result-overlay">
          <div className={`result-card ${result.correct ? 'result-correct' : 'result-wrong'}`}>
            <div className="result-emoji">
              {result.correct
                ? ['🎉', '⭐', '🌟', '🏆', '🎊'][Math.floor(Math.random() * 5)]
                : ['😅', '🤔', '💪', '😊'][Math.floor(Math.random() * 4)]}
            </div>
            <div className="result-text">{result.correct ? '정답이에요!' : '다시 해봐요!'}</div>
            <div className="result-sub">
              {result.correct
                ? `정답: ${
                    problem.multiChoices && problem.multiAnswer
                      ? problem.multiAnswer.map(i => problem.multiChoices![i]).join(', ')
                      : problem.choices
                        ? problem.choices[problem.answer]
                        : problem.answer
                  }`
                : problem.multiChoices
                  ? '다시 골라봐요!'
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
