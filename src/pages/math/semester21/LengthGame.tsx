/**
 * LengthGame — 2학년 1학기 4단원 "길이 재기" 게임 (독립 UI)
 *
 * 문제 유형:
 *   ① 길이 읽기 (0에서 시작): 자의 왼쪽 끝(0cm)부터 물체 길이 읽기
 *   ② 눈금 재기 (중간 시작): 물체 시작 눈금과 끝 눈금으로 길이 계산
 *   ③ 두 길이 비교: 더 긴/짧은 것 고르기 또는 길이 차이 계산
 *
 * 난이도: 초등 2학년 (cm 단위, 1~15cm 범위)
 */
import { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import RulerSVG from '../../../components/RulerSVG';

// ─── 유틸 ──────────────────────────────────────────────────────────────────
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: readonly T[]): T {
  return arr[rand(0, arr.length - 1)];
}

/** 정답과 겹치지 않는 오답 `count`개 생성 */
function makeWrongs(correct: number, min: number, max: number, count = 3): number[] {
  const set = new Set<number>();
  while (set.size < count) {
    const w = rand(min, max);
    if (w !== correct) set.add(w);
  }
  return [...set];
}

// ─── 타입 ──────────────────────────────────────────────────────────────────
type ProblemType = 'read0' | 'readMid' | 'compare';

interface RulerConfig {
  /** 물체 시작 위치 (mm 단위) */
  markerAt: number;
  /** 물체 끝 위치 (mm 단위) */
  markerEnd: number;
  /** 비교형 라벨 ('가', '나') */
  label?: string;
}

interface LengthProblem {
  type: ProblemType;
  question: ReactNode;
  rulers: RulerConfig[];
  choices: string[];
  answerIdx: number;
}

// ─── 상수 ──────────────────────────────────────────────────────────────────
const OBJECTS = ['연필', '색연필', '크레파스', '지우개', '풀', '가위', '칫솔'] as const;

const TYPE_LABELS: Record<ProblemType, string> = {
  read0:   '📏 길이 읽기',
  readMid: '📐 눈금 재기',
  compare: '⚖️ 길이 비교',
};

type Gen = () => LengthProblem;

// ─── 문제 생성기 ────────────────────────────────────────────────────────────

/**
 * 유형①: 0에서 시작 — 가장 기본적인 길이 읽기
 * 물체가 자의 0cm 위치에서 시작해 오른쪽 끝 눈금을 읽으면 바로 길이가 된다.
 * 범위: 2~15cm
 */
function genRead0(): LengthProblem {
  const cm = rand(2, 15);
  const obj = pick(OBJECTS);
  const wrongs = makeWrongs(cm, 1, 18);
  const choices = shuffle([cm, ...wrongs]).map(n => `${n}cm`);
  return {
    type: 'read0',
    question: <><strong>{obj}</strong>의 길이는 몇 cm인가요?</>,
    rulers: [{ markerAt: 0, markerEnd: cm * 10 }],
    choices,
    answerIdx: choices.indexOf(`${cm}cm`),
  };
}

/**
 * 유형②: 중간 시작 — 눈금 시작점을 고려한 길이 재기
 * 물체가 0cm가 아닌 위치에서 시작하므로 (끝 눈금 − 시작 눈금)을 계산해야 한다.
 * 범위: 물체 2~10cm, 시작 1~5cm
 */
function genReadMid(): LengthProblem {
  const cm = rand(2, 10);
  const startCm = rand(1, 5);
  const obj = pick(OBJECTS);
  const wrongs = makeWrongs(cm, 1, 14);
  const choices = shuffle([cm, ...wrongs]).map(n => `${n}cm`);
  return {
    type: 'readMid',
    question: (
      <>
        <strong>{obj}</strong>의 길이는 몇 cm인가요?
        <br />
        <small>(왼쪽·오른쪽 눈금을 모두 읽어요!)</small>
      </>
    ),
    rulers: [{ markerAt: startCm * 10, markerEnd: (startCm + cm) * 10 }],
    choices,
    answerIdx: choices.indexOf(`${cm}cm`),
  };
}

/**
 * 유형③: 두 길이 비교 — 가/나 두 물체를 각각 눈금자로 표시
 * 3가지 변형 중 하나가 랜덤으로 출제된다:
 *   - 변형 A: 더 긴 것은 어느 것인가요?  → 가/나 2지선다
 *   - 변형 B: 더 짧은 것은 어느 것인가요? → 가/나 2지선다
 *   - 변형 C: 두 길이의 차이는 몇 cm인가요? → 4지선다
 * 두 물체의 길이 차이는 최소 2cm 이상 보장(눈으로 확인하기 쉽게).
 */
function genCompare(): LengthProblem {
  // 두 물체 길이: 최소 2cm 차이 보장
  let cmA = rand(3, 11);
  let cmB: number;
  do { cmB = rand(2, 12); } while (Math.abs(cmA - cmB) < 2);

  // 두 눈금자가 같은 0cm에서 시작해야 비교가 공정함
  // (단, 눈금 재기 문제처럼 중간 시작도 허용)
  const startA = rand(0, 2);
  const startB = rand(0, 2);

  const rulers: RulerConfig[] = [
    { markerAt: startA * 10, markerEnd: (startA + cmA) * 10, label: '가' },
    { markerAt: startB * 10, markerEnd: (startB + cmB) * 10, label: '나' },
  ];

  const variant = rand(0, 2); // 0: 더 긴 것, 1: 더 짧은 것, 2: 차이 cm

  if (variant === 0) {
    const answerLabel = cmA > cmB ? '가' : '나';
    return {
      type: 'compare',
      question: <>더 <strong>긴</strong> 것은 어느 것인가요?</>,
      rulers,
      choices: ['가', '나'],
      answerIdx: answerLabel === '가' ? 0 : 1,
    };
  }

  if (variant === 1) {
    const answerLabel = cmA < cmB ? '가' : '나';
    return {
      type: 'compare',
      question: <>더 <strong>짧은</strong> 것은 어느 것인가요?</>,
      rulers,
      choices: ['가', '나'],
      answerIdx: answerLabel === '가' ? 0 : 1,
    };
  }

  // variant === 2: 길이 차이 계산
  const diff = Math.abs(cmA - cmB);
  const wrongs = makeWrongs(diff, 1, 10);
  const choices = shuffle([diff, ...wrongs]).map(n => `${n}cm`);
  return {
    type: 'compare',
    question: <><strong>가</strong>와 <strong>나</strong>의<br />길이 차이는 몇 cm인가요?</>,
    rulers,
    choices,
    answerIdx: choices.indexOf(`${diff}cm`),
  };
}

const generators: Gen[] = [genRead0, genReadMid, genCompare];

function generate(): LengthProblem {
  return pick(generators)();
}

// ─── 컨페티 ────────────────────────────────────────────────────────────────
function launchConfetti(cont: HTMLDivElement | null): void {
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

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────
export default function LengthGame() {
  const navigate = useNavigate();

  const [problem, setProblem] = useState<LengthProblem>(generate);
  const [score, setScore]     = useState(0);
  const [resultEmoji, setResultEmoji] = useState('');
  const [wrongChoice, setWrongChoice] = useState('');
  const [result, setResult]   = useState<{ show: boolean; correct: boolean }>({
    show: false, correct: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // ── 선택지 클릭 ──────────────────────────────────────────────────────────
  const onChoice = useCallback(
    (idx: number) => {
      if (result.show) return; // 결과 표시 중 중복 클릭 방지

      const correct = idx === problem.answerIdx;

      if (correct) {
        const emojis = ['🎉', '⭐', '🌟', '🏆', '🎊'];
        setResultEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
        setScore(s => s + 1);
        setResult({ show: true, correct: true });
        launchConfetti(containerRef.current);
      } else {
        const emojis = ['😅', '🤔', '💪', '😊'];
        setResultEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
        setWrongChoice(problem.choices[idx]);
        setResult({ show: true, correct: false });
        setTimeout(() => {
          setResult({ show: false, correct: false });
          setWrongChoice('');
        }, 1500);
      }
    },
    [problem, result.show],
  );

  // ── 다음 문제 ────────────────────────────────────────────────────────────
  const nextProblem = useCallback(() => {
    setProblem(generate());
    setResult({ show: false, correct: false });
    setWrongChoice('');
  }, []);

  // ── 렌더 ─────────────────────────────────────────────────────────────────
  return (
    <div className="game-page" ref={containerRef}>

      {/* ── 헤더 ── */}
      <div className="game-header">
        <button className="back-btn" onClick={() => navigate('/math/semester21')}>
          ← 뒤로
        </button>
        <span className="title">4단원: 길이재기</span>
        <span className="score">✓ {score}</span>
      </div>

      {/* ── 문제 영역 ── */}
      <div className="length-content">
        {/* 문제 유형 뱃지 */}
        <span className="length-type-badge">{TYPE_LABELS[problem.type]}</span>

        {/* 문제 텍스트 */}
        <p className="quiz-text length-question">{problem.question}</p>

        {/* 눈금자: 유형①② → 1개, 유형③ → 2개 */}
        {problem.rulers.length === 1 ? (
          <RulerSVG
            markerAt={problem.rulers[0].markerAt}
            markerEnd={problem.rulers[0].markerEnd}
            readOnly
          />
        ) : (
          <div className="length-rulers-compare">
            {problem.rulers.map((r, i) => (
              <div key={i} className="length-ruler-item">
                {r.label !== undefined && (
                  <span className="length-ruler-label">{r.label}</span>
                )}
                <RulerSVG markerAt={r.markerAt} markerEnd={r.markerEnd} readOnly />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 선택지 ── */}
      <div className="input-area">
        <div className="choice-area">
          {problem.choices.map((text, i) => (
            <button key={i} className="choice-btn" onClick={() => onChoice(i)}>
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* ── 결과 오버레이 ── */}
      {result.show && (
        <div className="result-overlay">
          <div className={`result-card ${result.correct ? 'result-correct' : 'result-wrong'}`}>
            <div className="result-emoji">{resultEmoji}</div>
            <div className="result-text">
              {result.correct ? '정답이에요!' : '다시 해봐요!'}
            </div>
            <div className="result-sub">
              {result.correct
                ? `정답: ${problem.choices[problem.answerIdx]}`
                : `${wrongChoice}은(는) 아니에요!`}
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
